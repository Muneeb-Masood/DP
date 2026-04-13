const CreditCardStrategy = require('./CreditCardStrategy');
const JazzCashStrategy = require('./JazzCashStrategy');
const EasyPaisaStrategy = require('./EasyPaisaStrategy');

class PaymentStrategyFactory {
    static create(method) {
        const normalizedMethod = String(method || '').trim().toLowerCase();

        switch (normalizedMethod) {
            case 'creditcard':
            case 'credit-card':
                return new CreditCardStrategy();
            case 'jazzcash':
                return new JazzCashStrategy();
            case 'easypaisa':
                return new EasyPaisaStrategy();
            default:
                return new CreditCardStrategy();
        }
    }
}

module.exports = PaymentStrategyFactory;
