"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.sendByeEmail = exports.sendWelcomeEmail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
function sendWelcomeEmail(to) {
    return __awaiter(this, void 0, void 0, function* () {
        mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to,
            from: "nishanthdipali@gmail.com",
            templateId: process.env.SENDGRID_TEMPLATE_ID,
            dynamic_template_data: {
                subject: "Welcome to the shop",
            },
        };
        try {
            yield mail_1.default.send(msg);
            console.log("Email sent");
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.sendWelcomeEmail = sendWelcomeEmail;
function sendByeEmail(to, username) {
    return __awaiter(this, void 0, void 0, function* () {
        mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to,
            from: "nishanthdipali@gmail.com",
            templateId: process.env.SENDGRID_BYE_TEMPLATE_ID,
            dynamic_template_data: {
                username,
            },
        };
        try {
            yield mail_1.default.send(msg);
            console.log("Email sent");
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.sendByeEmail = sendByeEmail;
function sendEmail(to, text, from) {
    return __awaiter(this, void 0, void 0, function* () {
        mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to,
            from: to,
            subject: `Report from ${from}`,
            text,
        };
        try {
            yield mail_1.default.send(msg);
            console.log("Email sent");
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.sendEmail = sendEmail;
//# sourceMappingURL=sendEmail.js.map