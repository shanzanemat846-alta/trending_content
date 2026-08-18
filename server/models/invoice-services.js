const Invoice = require('./invoice.model');

const { ThrowMissingParamsError } = require('../utils/throw-missing-params-error');

const AddInvoice = async ({
  userId,
  paymentId,
  amount,
  currency,
  status,
  subscriptionPlan,
  subscriptionType,
  transactionDetails,
  cardDetails,
  paymentType
}) => {
  const newInvoice = new Invoice({
    userId,
    paymentId,
    amount,
    currency,
    status,
    subscriptionPlan,
    subscriptionType,
    transactionDetails,
    cardDetails,
    paymentType
  });

  await newInvoice.save();
  return newInvoice;
};

const GetInvoice = async ({ filterParams, selectParams = {} }) => {
  ThrowMissingParamsError([filterParams]);

  const response = await Invoice
    .findOne(filterParams)
    .select(selectParams);

  return response;
};

const GetInvoices = async ({ filterParams, selectParams = {} }) => {
  ThrowMissingParamsError([filterParams]);

  const response = await Invoice
    .find(filterParams)
    .select(selectParams)
    .sort({ createdAt: -1 });

  return response;
};


module.exports = {
  AddInvoice,
  GetInvoices,
  GetInvoice
};
