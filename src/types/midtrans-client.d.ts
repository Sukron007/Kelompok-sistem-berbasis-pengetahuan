declare module 'midtrans-client' {
  export class Snap {
    constructor(options: { isProduction?: boolean; serverKey?: string; clientKey?: string });
    createTransaction(parameter: any): Promise<{ token: string; redirect_url: string }>;
    createTransactionToken(parameter: any): Promise<string>;
    createTransactionRedirectUrl(parameter: any): Promise<string>;
  }

  export class CoreApi {
    constructor(options: { isProduction?: boolean; serverKey?: string; clientKey?: string });
    charge(parameter: any): Promise<any>;
    transaction: {
      status(transactionIdOrOrderId: string): Promise<any>;
      approve(orderId: string): Promise<any>;
      deny(orderId: string): Promise<any>;
      cancel(orderId: string): Promise<any>;
      expire(orderId: string): Promise<any>;
      refund(orderId: string, parameter?: any): Promise<any>;
    };
  }

  const midtransClient: {
    Snap: typeof Snap;
    CoreApi: typeof CoreApi;
  };

  export default midtransClient;
}
