using Microsoft.AspNetCore.Mvc;
namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ServiceCategoryComSettingController : BaseController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}