using Microsoft.AspNetCore.Mvc;
namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CMSComSettingController : BaseController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}