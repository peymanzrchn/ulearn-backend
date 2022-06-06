const User = require("../models/user");
const fetch = require("node-fetch");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/mailer");

exports.handleLogin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error("کاربری با این ایمیل یافت نشد.");
            error.statusCode = 404;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);
        if (isEqual) {
            const token = jwt.sign(
                {
                    user: {
                        userId: user._id.toString(),
                        email: user.email,
                        fullname: user.fullname,
                    },
                },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );
            res.status(200).json({ token, userId: user._id.toString() });
        } else {
            const error = new Error("آدرس ایمیل یا کلمه‌ی عبور اشتباه هست");
            error.statusCode = 422;
            throw error;
        }
    } catch (err) {
        next(err);
    }
};

exports.createUser = async (req, res, next) => {
    try {
        await User.userValidation(req.body);
        const { fullname, email, password } = req.body;

        const user = await User.findOne({ email });
        if (user) {
            const error = new Error("کاربری با این ایمیل موجود است.");
            error.statusCode = 422;
            throw error;
        }

        const hash = await bcrypt.hash(password, 10);
        await User.create({ fullname, email, password: hash });
        sendEmail(
            email,
            fullname,
            "خوش آمدید به وبلاگ ما",
            "خیلی خوشحالیم از اینکه به جمع ما اضافه شدید."
        );
        res.status(201).json({ message: "عضویت موفقیت‌آمیز بود." });
    } catch (err) {
        next(err);
    }
};

exports.handleForgetPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error("کاربری با این ایمیل در پایگاه داده ثبت نشده است.");
            error.statusCode = 404;
            throw error;
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const resetLink = `http://localhost:3000/reset-password?token=${token}`;
        sendEmail(
            user.email,
            user.fullname,
            "فراموشی رمز عبور",
            `جهت تغییر رمز عبور فعلی روی لینک زیر کلیک کنید.
    <a href="${resetLink}">لینک تغییر رمز عبور</a>`
        );
        res.status(200).json({ message: "لینک ریست با موفقیت ارسال شد." });
    } catch (err) {
        next(err);
    }
};

exports.handleResetPassword = async (req, res, next) => {
    const token = req.params.token;
    const { password, confirmPassword } = req.body;

    try {
        let decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedToken) {
            const error = new Error("شما مجوز این عملیات را ندارید.");
            error.statusCode = 401;
            throw error;
        }

        if (password !== confirmPassword) {
            const error = new Error("کلمه های عبور یکسان نیستند.");
            error.statusCode = 422;
            throw error;
        }

        const user = await User.findOne({ _id: decodedToken.userId });
        if (!user) {
            const error = new Error("کاربری با این شناسه در پایگاه داده ثبت نشده است.");
            error.statusCode = 401;
            throw error;
        }
        user.password = await bcrypt.hash(password, 10);
        await user.save();

        res.status(200).json({ message: "عملیات با موفقیت انجام شد." });
    } catch (err) {
        next(err);
    }
};
