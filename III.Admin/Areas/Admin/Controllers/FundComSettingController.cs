using Microsoft.AspNetCore.Mvc;
namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class FundComSettingController : BaseController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}