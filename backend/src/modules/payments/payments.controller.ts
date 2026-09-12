import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { paymentsService } from "./payments.service";
import { constructWebhookEvent } from "../../services/stripe/stripe.service";
import { ApiError } from "../../utils/apiError";

export const paymentsController = {
  createIntent: asyncHandler(async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const data = await paymentsService.createPaymentIntent(bookingId, req.auth!.sub);
    res.json({ success: true, data });
  }),

  getPayment: asyncHandler(async (req: Request, res: Response) => {
    const payment = await paymentsService.getPaymentForBooking(req.params.bookingId);
    res.json({ success: true, data: payment });
  }),

  refund: asyncHandler(async (req: Request, res: Response) => {
    const refund = await paymentsService.refund(req.params.bookingId, req.auth!.sub);
    res.json({ success: true, data: { refundId: refund.id } });
  }),

  /**
   * Raw body is needed for Stripe signature verification —
   * this route must be mounted BEFORE express.json() middleware.
   */
  webhook: asyncHandler(async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    if (!sig) throw ApiError.badRequest("Missing stripe-signature header.");

    let event;
    try {
      event = constructWebhookEvent(req.body as Buffer, sig);
    } catch (err: any) {
      throw ApiError.badRequest(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as any;
        await paymentsService.confirmFromWebhook(intent.id);
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as any;
        await paymentsService.failFromWebhook(
          intent.id,
          intent.last_payment_error?.message
        );
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  }),
};