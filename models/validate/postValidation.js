const Yup = require("yup");

exports.schema = Yup.object().shape({
    title: Yup.string()
        .required("عنوان پست الزامی میباشد.")
        .min(5, "عنوان پست نباید کمتر از 5 کاراکتر باشد.")
        .max(100, "عنوان پست نباید بیشتر از 100 کاراکتر باشد."),
    info: Yup.string().required("پست جدید باید دارای محتوا باشد."),
    price: Yup.number().required("نوشتن قیمت الزامی میباشد."),
    thumbnail: Yup.object().shape({
        name: Yup.string().required("عکس بند انگشتی الزامی میباشد."),
        size: Yup.number().max(3000000, "عکس نباید بیشتر از 3 مگابایت باشد."),
        mimetype: Yup.mixed().oneOf(
            ["image/jpeg", "image/png"],
            "تنها پسوند jpeg , png پشتیبانی میشود."
        ),
    }),
});
