using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MaterialStoreController : BaseController
    {
        private readonly EIMDBContext _context;

        public MaterialStoreController(EIMDBContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }
    }

}