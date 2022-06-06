const fs = require("fs");

const Course = require("../models/course");
const sharp = require("sharp");
const shortId = require("shortid");
const appRoot = require("app-root-path");

exports.createCourse = async (req, res, next) => {
    const thumbnail = req.files ? req.files.thumbnail : {};
    const fileName = `${shortId.generate()}_${thumbnail.name}`;
    const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;

    try {
        req.body = { ...req.body, thumbnail };
        await Course.courseValidation(req.body);

        await sharp(thumbnail.data)
            .jpeg({ quality: 60 })
            .toFile(uploadPath)
            .catch((err) => console.log(err));

        await Course.create({ ...req.body, user: req.userId.toString(), thumbnail: fileName });

        res.status(201).json({ message: "ساخت پست با موفقیت انجام شد." });
    } catch (err) {
        next(err);
    }
};

exports.editCourse = async (req, res, next) => {
    const thumbnail = req.files ? req.files.thumbnail : {};
    const fileName = `${shortId.generate()}_${thumbnail.name}`;
    const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;

    const course = await Course.findOne({ _id: req.params.id });

    try {
        if (thumbnail.name) await Course.courseValidation({ ...req.body, thumbnail });
        else {
            await Course.courseValidation({
                ...req.body,
                thumbnail: {
                    name: "placeholder",
                    size: 0,
                    mimetype: "image/jpeg",
                },
            });
        }

        if (!course) {
            const error = new Error("پستی با این شناسه یافت نشد.");
            error.statusCode = 404;
            throw error;
        }

        if (course.user.toString() !== req.userId) {
            const error = new Error("شما مجوز ویرایش این پست را ندارید.");
            error.statusCode = 401;
            throw error;
        } else {
            if (thumbnail.name) {
                fs.unlink(
                    `${appRoot}/public/uploads/thumbnails/${course.thumbnail}`,
                    async (err) => {
                        if (err) console.log(err);
                        else {
                            await sharp(thumbnail.data)
                                .jpeg({ quality: 60 })
                                .toFile(uploadPath)
                                .catch((err) => console.log(err));
                        }
                    }
                );
            }

            const { title, price, info } = req.body;
            course.title = title;
            course.price = price;
            course.info = info;
            course.thumbnail = thumbnail.name ? fileName : course.thumbnail;
        }
        await course.save();
        res.status(200).json({ message: "پست با موفقیت ویرایش شد." });
    } catch (err) {
        next(err);
    }
};

exports.deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findByIdAndRemove(req.params.id);
        const filePath = `${appRoot}/public/uploads/thumbnails/${course.thumbnail}`;

        fs.unlink(filePath, (err) => {
            if (err) {
                const error = new Error("خطای در پاکسازی پست مربوطه رخ داده است.");
                error.statusCode = 400;
                throw error;
            } else {
                res.status(200).json({ message: "پست با موفقیت حذف شد." });
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.uploadImage = (req, res) => {
    const upload = multer({
        limits: { fileSize: 4000000 },
        fileFilter: fileFilter,
    }).single("image");

    upload(req, res, async (err) => {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(422).json({
                    error: "حجم عکس ارسالی نباید بیشتر از 4 مگابایت باشد",
                });
            }
            res.status(400).json({ error: err });
        } else {
            if (req.files) {
                const fileName = `${shortId.generate()}_${req.files.image.name}`;
                await sharp(req.files.image.data)
                    .jpeg({
                        quality: 60,
                    })
                    .toFile(`./public/uploads/${fileName}`)
                    .catch((err) => console.log(err));
                res.status(200).json({
                    image: `http://localhost:4000/uploads/${fileName}`,
                });
            } else {
                res.status(400).json({
                    error: "جهت آپلود باید عکسی انتخاب کنید",
                });
            }
        }
    });
};
