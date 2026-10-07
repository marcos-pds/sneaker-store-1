using SneakerStore.Infrastructure;
using SneakerStore.Infrastructure.Context;
using SneakerStore.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Controllers e documentação Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. Registro do MongoDbContext como Singleton
builder.Services.AddSingleton<MongoDbContext>();

// 3. Registro dos Serviços com seu respectivo ciclo de vida (Scoped / HttpClient)
builder.Services.AddScoped<DropshippingService>();
builder.Services.AddHttpClient<AliExpressImporterService>();

// 4. Configuração da política de CORS para React (Vite / Dev Server)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:6006")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// 5. Pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Aplicação do CORS antes do roteamento dos endpoints
app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();