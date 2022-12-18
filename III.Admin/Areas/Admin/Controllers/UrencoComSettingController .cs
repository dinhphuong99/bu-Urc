using Microsoft.AspNetCore.Mvc;
namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class UrencoComSettingController : BaseController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}