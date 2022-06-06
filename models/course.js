const mongoose = require("mongoose");
const { schema } = require("./validate/postValidation");

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255,
    },

    info: {
        type: String,
        required: true,
    },

    price: {
        type: Number,
        required: true,
    },

    thumbnail: {
        type: String,
        required: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

courseSchema.index({ title: "text" });

courseSchema.statics.courseValidation = function (body) {
    return schema.validate(body, { abortEarly: false });
};

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
