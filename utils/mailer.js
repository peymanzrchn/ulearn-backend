const nodeMailer = require("nodemailer");

exports.sendEmail = (email, fullname, subject, message) => {
    const transporter = nodeMailer.createTransport({
        host: "smtp.gmail.com",
        service: "gmail",
        port: 465,
        secure: true,
        auth: {
            user: "peymanzarchini1@gmail.com",
            pass: "P={}[]%902503727",
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    transporter.sendMail({
        from: "peymanzarchini1@gmail.com",
        to: email,
        subject: subject,
        html: `<h1>سلام ${fullname}</h1>
            <p>${message}</p>`,
    });
};
