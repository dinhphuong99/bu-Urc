using Microsoft.AspNetCore.Mvc;
namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ContractComSettingController : BaseController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}