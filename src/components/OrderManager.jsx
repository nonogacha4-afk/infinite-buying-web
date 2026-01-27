import React, { useState } from 'react';
import { Clipboard, ShieldAlert, CheckCircle2, Save } from 'lucide-react';

const OrderManager = ({ buyingOrders, sellingOrders, metrics, t }) => {
    const [fillQty, setFillQty] = useState('');
    const [fillPrice, setFillPrice] = useState('');
    const [executedBy, setExecutedBy] = useState('LAOG_PT_v2');

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert(t('copyAlert'));
    };

    return (
        <div className="card glass-card zone-execution-card">
            <div className="card-header">
                <h3>EXECUTION</h3>
            </div>

            <div className="execution-content">
                {/* Active Orders List */}
                <div className="active-order-summary">
                    {buyingOrders.concat(sellingOrders).map((order, i) => (
                        <div key={i} className="order-item-compact">
                            <div className={`order-tag ${order.type.includes('BUY') || order.type.includes('AUTO') ? 'buy' : 'sell'}`}>
                                {order.type}
                            </div>
                            <div className="order-brief">
                                <span className="brief-shares">{order.quantity} sh</span>
                                <span className="brief-at">@</span>
                                <span className="brief-price">${order.price.toFixed(2)}</span>
                            </div>
                            <button className="btn-copy-mini" onClick={() => copyToClipboard(`${order.price.toFixed(2)}, ${order.quantity}`)}>
                                <Clipboard size={14} />
                            </button>
                        </div>
                    ))}
                    {buyingOrders.length === 0 && sellingOrders.length === 0 && (
                        <div className="no-order-wait">
                            <ShieldAlert size={16} />
                            <span>No active orders to execute.</span>
                        </div>
                    )}
                </div>

                {/* Fill Inputs */}
                <div className="fill-form-grid">
                    <div className="fill-input-group">
                        <label>Fill Qty</label>
                        <input
                            type="number" value={fillQty}
                            onChange={(e) => setFillQty(e.target.value)}
                            placeholder="0.00"
                            className="fill-input"
                        />
                    </div>
                    <div className="fill-input-group">
                        <label>Fill Price</label>
                        <input
                            type="number" value={fillPrice}
                            onChange={(e) => setFillPrice(e.target.value)}
                            placeholder="0.00"
                            className="fill-input"
                        />
                    </div>
                </div>

                <div className="fill-input-group full-width">
                    <label>Executed By</label>
                    <input
                        type="text" value={executedBy}
                        onChange={(e) => setExecutedBy(e.target.value)}
                        className="fill-input-text"
                    />
                </div>

                <button className="btn-action-save">
                    <Save size={18} />
                    <span>SAVE TO TRADE_LOG</span>
                </button>
            </div>
        </div>
    );
};

export default OrderManager;
