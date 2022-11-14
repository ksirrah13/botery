import nodemailer from 'nodemailer';
import { getTennisCourtUrl } from './puppeteer-helpers';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.FROM_EMAIL, // junk user account
    pass: process.env.EMAIL_PASSWORD, // generated app password
  },
});

export const sendAlert = async (
  recipientEmailList: string[],
  courtId: string,
  date: Date,
  times: string[],
) => {
  // create reusable transporter object using the default SMTP transport
  const tennisUrlPage = getTennisCourtUrl(courtId, date);

  // send mail with defined transport object
  await transporter.sendMail({
    from: process.env.FROM_EMAIL, // sender address
    to: recipientEmailList, // list of receivers
    subject: 'Botery Alert!', // Subject line
    text: `Found Available Court Openings! ${times} ${tennisUrlPage}`, // plain text body
  });

  console.log('Message sent!');
};
