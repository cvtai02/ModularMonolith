using Content.Core.Usecases.Galleries;
using Content.DTOs.Galleries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Authorization;
using SharedKernel.DTOs;

namespace Content.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/galleries")]
public class GalleryController(
    GetPublicGalleryByKey getPublicGalleryByKey,
    ListAdminGalleries listAdminGalleries,
    GetAdminGalleryById getAdminGalleryById,
    CreateGallery createGallery,
    UpdateGallery updateGallery,
    DeleteGallery deleteGallery) : ControllerBase
{
    [HttpGet("{key}")]
    public async Task<ActionResult<GalleryResponse>> GetPublicByKey(
        string key,
        CancellationToken cancellationToken)
    {
        var result = await getPublicGalleryByKey.ExecuteAsync(key, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpGet("admin")]
    public async Task<ActionResult<PaginatedList<GallerySummaryResponse>>> GetAdmin(
        [FromQuery] ListGalleriesRequest request,
        CancellationToken cancellationToken)
        => Ok(await listAdminGalleries.ExecuteAsync(request, cancellationToken));

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpGet("admin/{id:int}")]
    public async Task<ActionResult<GalleryResponse>> GetAdminById(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await getAdminGalleryById.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpPost]
    public async Task<ActionResult<GalleryResponse>> Create(
        [FromBody] CreateGalleryRequest request,
        CancellationToken cancellationToken)
    {
        var result = await createGallery.ExecuteAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetAdminById), new { id = result.Id }, result);
    }

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<GalleryResponse>> Update(
        int id,
        [FromBody] UpdateGalleryRequest request,
        CancellationToken cancellationToken)
    {
        var result = await updateGallery.ExecuteAsync(id, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Policy = Policies.TenantAdminUp)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        var deleted = await deleteGallery.ExecuteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
