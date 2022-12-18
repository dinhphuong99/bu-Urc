using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Data;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class UrencoMap1Controller : BaseController
    {
        private readonly EIMDBContext _context;
        public UrencoMap1Controller(EIMDBContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public object insert([FromBody]UrencoRoute jTablePara)
        {
            var msg = new JMessage() { Error = false };
            try
            {

            }
            catch(Exception ex)
            {

            }

            return Json(msg);
        }
    }
}