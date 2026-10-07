using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SneakerStore.Domain.Entities
{
    public class Order
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        // Dados do Comprador e Contato
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string CustomerCpf { get; set; } = string.Empty;

        // Endereço Detalhado de Entrega
        public Address ShippingAddress { get; set; } = new();

        [BsonIgnore]
        public string ZipCode
        {
            get => ShippingAddress?.ZipCode ?? string.Empty;
            set { if (ShippingAddress == null) ShippingAddress = new Address(); ShippingAddress.ZipCode = value; }
        }

        // Itens do Pedido
        public List<OrderItem> Items { get; set; } = new();

        // Detalhamento Financeiro e Lucratividade
        public decimal Subtotal { get; set; }
        public decimal ShippingFee { get; set; }          // Frete cobrado do cliente
        public decimal DiscountAmount { get; set; }        // Descontos / Cupons
        public decimal TotalAmount { get; set; }           // Valor bruto pago pelo cliente
        public decimal GatewayFee { get; set; }            // Taxa retida pelo Mercado Pago
        public decimal NetReceivedAmount { get; set; }     // Valor líquido creditado (TotalAmount - GatewayFee)
        public decimal TotalCostPrice { get; set; }        // Custo total pago aos fornecedores (Dropshipping)
        public decimal NetProfit { get; set; }             // Lucro líquido real (NetReceivedAmount - TotalCostPrice)

        // Pagamento e Parcelamento
        public string PaymentStatus { get; set; } = "Pending"; // "Pending", "Paid", "Refunded", "Cancelled"
        public string? ExternalPaymentId { get; set; }
        public string PaymentMethod { get; set; } = string.Empty; // "PIX" ou "CreditCard"
        public string? CardBrand { get; set; }
        public int Installments { get; set; } = 1;

        // Dropshipping / Fornecedor
        public string DropshippingStatus { get; set; } = "PendingOrder";
        public string? ExternalSupplierOrderId { get; set; }
        public string? TrackingCode { get; set; }
        public string? Carrier { get; set; }

        // Auditoria e Datas
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class Address
    {
        public string ZipCode { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string Number { get; set; } = string.Empty;
        public string? Complement { get; set; }
        public string Neighborhood { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;

        public override string ToString()
        {
            var comp = string.IsNullOrWhiteSpace(Complement) ? "" : $", {Complement}";
            return $"{Street}, {Number}{comp} - {Neighborhood}, {City} - {State}, CEP: {ZipCode}";
        }

        public static implicit operator string(Address address)
        {
            return address?.ToString() ?? string.Empty;
        }
    }

    public class OrderItem
    {
        public string Sku { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int Quantity { get; set; } = 1;
        public decimal Price { get; set; }             // Preço cobrado do cliente na loja
        public decimal CostPrice { get; set; }         // Custo de compra no fornecedor (AliExpress / CJ / Fábrica)
        public string? Size { get; set; }
        public string? SupplierUrl { get; set; }
    }
}