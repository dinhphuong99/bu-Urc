using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Collections.Generic;
using System.Globalization;



namespace III.Admin.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class WorkerController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        public WorkerController(EIMDBContext context, IUploadService upload)
        {
            _context = context;
            _upload = upload;
        }
        public IActionResult Index()
        {
            return View();
        }
       
    }
}