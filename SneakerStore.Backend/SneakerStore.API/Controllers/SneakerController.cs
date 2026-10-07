using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using SneakerStore.Domain.Entities;
using SneakerStore.Infrastructure.Context;
using SneakerStore.Infrastructure.Services;

namespace SneakerStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SneakerController : ControllerBase
    {
        private readonly MongoDbContext _context;

        public SneakerController(MongoDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/sneaker?onlyPublished=true
        // Retorna os produtos. Se onlyPublished for true (usado pelas páginas públicas Home/Catalog),
        // traz tudo que não for explicitamente IsPublished == false (incluindo registros antigos sem a propriedade).
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sneaker>>> GetAll([FromQuery] bool onlyPublished = false)
        {
            FilterDefinition<Sneaker> filter = onlyPublished
                ? Builders<Sneaker>.Filter.Ne(s => s.IsPublished, false)
                : Builders<Sneaker>.Filter.Empty;

            var sneakers = await _context.Sneakers.Find(filter).ToListAsync();
            return Ok(sneakers);
        }

        // 2. GET: api/sneaker/{id}
        // Retorna os detalhes de um sneaker específico por ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Sneaker>> GetById(string id)
        {
            FilterDefinition<Sneaker> filter = BuildIdFilter(id);

            var sneaker = await _context.Sneakers.Find(filter).FirstOrDefaultAsync();
            if (sneaker == null) return NotFound("Sneaker não encontrado.");

            return Ok(sneaker);
        }

        // 3. POST: api/sneaker
        // Cadastra um novo sneaker manualmente
        [HttpPost]
        public async Task<ActionResult<Sneaker>> Create([FromBody] Sneaker sneaker)
        {
            await _context.Sneakers.InsertOneAsync(sneaker);
            return CreatedAtAction(nameof(GetById), new { id = sneaker.Id }, sneaker);
        }

        // 4. POST: api/sneaker/import-aliexpress
        // Importa as fotos, título e preço do AliExpress diretamente em modo Rascunho (IsPublished = false)
        [HttpPost("import-aliexpress")]
        public async Task<ActionResult<Sneaker>> ImportFromAliExpress(
            [FromQuery] string url,
            [FromQuery] decimal margin = 50,
            [FromServices] AliExpressImporterService importerService = null!)
        {
            if (string.IsNullOrWhiteSpace(url))
                return BadRequest("Forneça a URL do produto no AliExpress.");

            var sneaker = await importerService.ImportFromAliExpressAsync(url, margin);
            if (sneaker == null)
                return BadRequest("Não foi possível extrair as informações deste produto.");

            // Garante que o produto importado fique como RASCUNHO (despublicado) para curadoria no Admin
            sneaker.IsPublished = false;

            await _context.Sneakers.InsertOneAsync(sneaker);
            return CreatedAtAction(nameof(GetById), new { id = sneaker.Id }, sneaker);
        }

        // 5. PUT: api/sneaker/{id}
        // Atualiza título, fotos, descrição e status de publicação (Aprovação) do sneaker
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Sneaker updatedSneaker)
        {
            FilterDefinition<Sneaker> filter = BuildIdFilter(id);

            updatedSneaker.Id = id; // Mantém o ID original do documento no MongoDB

            var result = await _context.Sneakers.ReplaceOneAsync(filter, updatedSneaker);

            if (result.MatchedCount == 0)
            {
                return NotFound("Sneaker não encontrado para atualização.");
            }

            return NoContent(); // HTTP 204
        }

        // 6. DELETE: api/sneaker/{id}
        // Exclui um sneaker do catálogo do MongoDB
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            FilterDefinition<Sneaker> filter = BuildIdFilter(id);

            var result = await _context.Sneakers.DeleteOneAsync(filter);

            if (result.DeletedCount == 0)
            {
                return NotFound("Sneaker não encontrado.");
            }

            return NoContent(); // HTTP 204
        }

        // Método auxiliar para tratar se o ID enviado é do tipo ObjectId do MongoDB ou String pura
        private static FilterDefinition<Sneaker> BuildIdFilter(string id)
        {
            if (ObjectId.TryParse(id, out ObjectId objectId))
            {
                return Builders<Sneaker>.Filter.Eq("_id", objectId);
            }

            return Builders<Sneaker>.Filter.Eq(s => s.Id, id);
        }
    }
}