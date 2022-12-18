using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AssetCommonSettingController : BaseController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}