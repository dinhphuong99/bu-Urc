﻿using Microsoft.AspNetCore.Mvc;
namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class ProjectComSettingController : BaseController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}