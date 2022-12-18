using Microsoft.AspNetCore.Mvc;
namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CustomerComSettingController : BaseController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}