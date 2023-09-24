import nodemailer from 'nodemailer';
   
export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: 'eduardog.carbonell@gmail.com',
      pass: "qvgcladzzqtzlrsz" }
  });

  transporter.verify()
  .then(() => {
    console.log('Ready for sending emails.');
  })
  .catch((error) => {
    console.error('Error with email transporter:', error);
  });
