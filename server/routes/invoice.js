const router = require("express").Router();

const { DownloadInvoice, GetInvoices } = require("../controllers/invoice");

const AuthenticateToken = require('../middleware/auth-token');

const { CatchResponse, TryResponse } = require('../utils/helpers');

const { ENDPOINTS } = require('../utils/constants');

router.get(ENDPOINTS.INVOICE.GET_INVOICES, AuthenticateToken, async (req, res) => {
  try {
    const { params: { userId } } = req;

    const response = await GetInvoices({
      userId
    });

    const { invoicesList } = response;

    TryResponse({
      res,
      data: { invoicesList }
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.get(ENDPOINTS.INVOICE.DOWNLOAD_INVOICE, async (req, res) => {
  try {
    const { params: { userId } } = req;

    const headers = {
      'Content-type': 'application/vnd.ms-excel',
      'Transfer-Encoding': 'chunked',
      'Content-Disposition': 'attachment; filename=Invoice_SHEET.xlsx'
    };

    res.writeHead(200, headers);

    await DownloadInvoice({
      res,
      userId
    });

    res.send();
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

module.exports = router;
