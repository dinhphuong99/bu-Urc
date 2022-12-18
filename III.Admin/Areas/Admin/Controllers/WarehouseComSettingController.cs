using Microsoft.AspNetCore.Mvc;
namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class WarehouseComSettingController : BaseController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}