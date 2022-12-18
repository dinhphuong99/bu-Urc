using Microsoft.AspNetCore.Mvc;
namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EmployeeComSettingController : BaseController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}