using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using SneakerStore.Domain.Entities;

namespace SneakerStore.Infrastructure.Context
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        public MongoDbContext(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("MongoDb");
            var mongoUrl = MongoUrl.Create(connectionString);
            var client = new MongoClient(mongoUrl);
            _database = client.GetDatabase(mongoUrl.DatabaseName ?? "SneakerStoreDb");
        }

        // Coleção de Tênis
        public IMongoCollection<Sneaker> Sneakers => _database.GetCollection<Sneaker>("Sneakers");

        // ADICIONE ESTA LINHA PARA DECLARAR A COLEÇÃO DE PEDIDOS:
        public IMongoCollection<Order> Orders => _database.GetCollection<Order>("Orders");
    }
}