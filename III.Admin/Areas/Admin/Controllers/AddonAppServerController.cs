using System;
using System.Collections.Generic;
using System.Linq;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AddonAppServerController : BaseController
    {
        public class JtableAddonAppServerModel : JTableModel
        {
            public string ServerCode { get; set; }
            public string ServerAddress { get; set; }
            public string Note { get; set; }
        }
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;

        public AddonAppServerController(EIMDBContext context, IUploadService upload)
        {
            _context = context;
            _upload = upload;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public object JTable([FromBody]JtableAddonAppServerModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.AddonAppServers
                         where (string.IsNullOrEmpty(jTablePara.ServerCode) || a.ServerCode.ToLower().Contains(jTablePara.ServerCode.ToLower()))
                         && (string.IsNullOrEmpty(jTablePara.ServerAddress) || a.ServerAddress.ToLower().Contains(jTablePara.ServerAddress.ToLower()))
                         && (string.IsNullOrEmpty(jTablePara.Note) || a.Note.ToLower().Contains(jTablePara.Note.ToLower()))
                         select new
                         {
                             a.Id,
                             a.ServerCode,
                             a.AppCode,
                             a.AppVendorCode,
                             a.ServerAddress,
                             a.Status,
                             a.Note,
                         }).OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();

            var count = (from a in _context.AddonAppServers
                         select a).AsNoTracking().Count();
            var data = query.Select(x => new
            {
                x.Id,
                x.ServerCode,
                AppName = _context.AddonApps.FirstOrDefault(y => y.AppCode == x.AppCode)?.AppTitle,
                VendorName = _context.AppVendors.FirstOrDefault(y => y.VendorCode == x.AppVendorCode)?.Name,
                x.ServerAddress,
                x.Status,
                x.Note
            }).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ServerCode", "AppName", "VendorName", "ServerAddress", "Status", "Note");
            return Json(jdata);
        }

        [HttpPost]
        public object GetApp()
        {
            var data = _context.AddonApps.Select(x => new { Code = x.AppCode, Name = x.AppTitle });
            return data;
        }

        [HttpPost]
        public object GetVendor()
        {
            var data = _context.AppVendors.Select(x => new { Code = x.VendorCode, Name = x.Name });
            return data;
        }

        [HttpGet]
        public JsonResult GetItem(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.AddonAppServers.FirstOrDefault(x => x.Id == id);
            if (data != null)
            {
                msg.Object = data;
            }
            else
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS_FILE"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Insert([FromBody]List<AddonAppServer> listObj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                foreach (var item in listObj)
                {
                    _context.AddonAppServers.Add(item);
                }
                _context.SaveChanges();
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("AAS_TITLE_APP_ADDON"));
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_FAIL_ADD"), CommonUtil.ResourceValue("AAS_TITLE_APP_ADDON"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update([FromBody]AddonAppServer obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.AddonAppServers.FirstOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {
                    data.ServerCode = obj.ServerCode;
                    data.ServerAddress = obj.ServerAddress;
                    data.AppCode = obj.AppCode;
                    data.AppVendorCode = obj.AppVendorCode;
                    data.Note = obj.Note;
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("AAS_TITLE_APP_ADDON"));
                }
                else
                {
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("AAS_TITLE_APP_AAS_ADDON"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_FAIL"));
            }
            return Json(msg); 
        }

        [HttpPost]
        public JsonResult Delete([FromBody]int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.AddonAppServers.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    _context.AddonAppServers.Remove(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("AAS_TITLE_APP_ADDON"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("AAS_TITLE_APP_AAS_ADDON"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_DELETE"));
            }
            return Json(msg);
        }
    }
}