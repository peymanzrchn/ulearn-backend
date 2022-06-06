const Yup = require("yup");

exports.schema = Yup.object().shape({
    fullname: Yup.string()
        .required("نام و نام خانوادگی الزامی میباشد.")
        .min(5, "نام و نام خانوادگی نباید کمتر از 5 کاراکتر باشد")
        .max(100, "نام و نام خانوادگی نباید بیشتر از 100 کاراکتر باشد"),
    email: Yup.string().required("ایمیل الزامی میباشد.").email("ایمیل معتبر نمیباشد."),
    password: Yup.string()
        .required("کلمه ی عبور الزامی میباشد")
        .min(5, "کلمه ی عبور نباید کمتر از 4 کاراکتر باشد")
        .max(100, "کلمه ی عبور نباید بیشتر از 100 کاراکتر باشد"),
    confirmPassword: Yup.string()
        .required("تکرار کلمه ی عبور الزامی میباشد.")
        .oneOf([Yup.ref("password"), null], "کلمه های عبور یکسان نیستند."),
});
