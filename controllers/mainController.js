const Course = require("../models/course");
const captchaPng = require("captchapng");
const Yup = require("yup");
const { sendEmail } = require("../utils/mailer");

let captchaNum;

exports.getCourses = async (req, res, next) => {
    try {
        const numberOfCourse = await Course.find().countDocuments();

        const courses = await Course.find().sort({ createdAt: "desc" }).populate("user");

        if (!courses) {
            const error = new Error("هیچ دوره‌ای در پایگاه داده ثبت نشده است.");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ courses, total: numberOfCourse });
    } catch (err) {
        next(err);
    }
};

exports.getSingleCourse = async (req, res, next) => {
    try {
        const course = await Course.findOne({ _id: req.params.id }).populate("user");

        if (!course) {
            const error = new Error("دوره‌ای با این شناسه یافت نشد.");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ course });
    } catch (err) {
        next(err);
    }
};

exports.handleContactPage = async (req, res, next) => {
    const errorArr = [];

    const { fullname, email, message, captcha } = req.body;

    const schema = Yup.object().shape({
        fullname: Yup.string().required("نام و نام خانوادگی الزامی می باشد"),
        email: Yup.string().email("آدرس ایمیل صحیح نیست").required("آدرس ایمیل الزامی می باشد"),
        message: Yup.string().required("پیام اصلی الزامی می باشد"),
    });

    try {
        await schema.validate(req.body, { abortEarly: false });

        if (parseInt(captcha) === captchaNum) {
            sendEmail(
                email,
                fullname,
                "پیام از طرف وبلاگ",
                `${message} <br/> ایمیل کاربر : ${email}`
            );

            res.status(200).json({ message: "پیام شما با موفقیت ارسال شد." });
        }
    } catch (err) {
        err.inner.forEach((e) => {
            errorArr.push({
                name: e.path,
                message: e.message,
            });
        });
        const error = new Error("خطا در اعتبارسنجی");
        error.statusCode = 422; //error validate
        error.data = errorArr;
        next(error);
    }
};

exports.getCaptcha = (req, res) => {
    captchaNum = parseInt(Math.random() * 9000 + 1000);
    const p = new captchaPng(80, 30, captchaNum);
    p.color(0, 0, 0, 0);
    p.color(80, 80, 80, 255);

    const img = p.getBase64();
    const imgBase64 = Buffer.from(img, "base64");

    res.send(imgBase64);
};
