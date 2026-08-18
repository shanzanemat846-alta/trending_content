const Excel = require('exceljs');
const moment = require('moment');

const { GetInvoices } = require('../../models/invoice-services');

const { INVOICE_DOWNLOAD_SHEET } = require('../../utils/constants');

const DownloadInvoice = async ({
  res,
  userId
}) => {
  const invoicesList = await GetInvoices({
    filterParams: { userId }
  });

  const workbook = new Excel.stream.xlsx.WorkbookWriter({ stream : res });
  const sheet = workbook.addWorksheet('Invoices');
  sheet.columns = INVOICE_DOWNLOAD_SHEET;

  for (let i = 0; i < invoicesList.length; i += 1) {
    const { 
      status,
      createdAt,
      amount,
      currency,
      subscriptionPlan,
      subscriptionType,
      paymentType
    } = invoicesList[i];

    sheet.addRow({
      status,
      date: moment(createdAt).format('MM-DD-YYYY'),
      amount,
      currency,
      subscriptionPlan,
      subscriptionType,
      paymentType: paymentType === 'subscription' ? 'Subscription' : 'Token Purchase'
    });
  }

  sheet.commit();
  await workbook.commit();
};

module.exports = DownloadInvoice;
