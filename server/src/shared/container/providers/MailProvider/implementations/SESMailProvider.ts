import mailConfig from '@config/mail';
import aws from 'aws-sdk';
import { createTransport, Transporter } from 'nodemailer';
import { inject, injectable } from 'tsyringe';
import IMailTemplateProvider from '../../MailTemplateProvider/models/IMailTemplateProvider';
import ISendMailDTO from '../dtos/ISendMailDTO';
import IMailProvider from '../models/IMailProvider';

@injectable()
export default class SESMailProvider implements IMailProvider{
  private transporter: Transporter
  constructor(
    @inject('MailTemplateProvider')
    private mailTemplateProvider: IMailTemplateProvider
  ){
    const transporter = createTransport({
      SES: new aws.SES({
        apiVersion: '2010-12-01',
        region: 'us-east-1'
      })
    })

    this.transporter = transporter
  }
  async sendMail({
    to,
    from,
    subject,
    templateData
  }: ISendMailDTO): Promise<void> {
    const { name, address } = mailConfig.defaults.from
    this.transporter.sendMail({
      from: {
        address: from?.address || address,
        name: from?.name || name
      },
      to: {
        name: to.name,
        address: to.address
      },
      subject,
      html: await this.mailTemplateProvider.parse(templateData)
    })
  }

}
