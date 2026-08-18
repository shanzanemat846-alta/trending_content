const { GetInvoices: GeInvoicesDetails } = require('../../models/invoice-services');

const GeInvoices = async ({
  userId
}) => {
  const invoicesList = await GeInvoicesDetails({
    filterParams: { userId }
  });

  return {
    invoicesList
  }
};

module.exports = GeInvoices;
