﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class MaterialsTypeController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<MaterialsTypeController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public MaterialsTypeController(EIMDBContext context, IStringLocalizer<MaterialsTypeController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View();
        }

        public class JTableModelMaterial : JTableModel
        {
            public string MaterialCode { get; set; }
            public string MaterialName { get; set; }
            public int? MaterialParent { get; set; }
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelMaterial jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            string code = jTablePara.MaterialCode.ToLower();
            string name = jTablePara.MaterialName.ToLower();
            int? parent = jTablePara.MaterialParent;

            var query = from a in _context.MaterialTypes
                        where (a.IsDeleted == false &&
                               a.Code.ToLower().Contains(code) &&
                               a.Name.ToLower().Contains(name) &&
                               (parent == null || parent == a.ParentId))
                        select new
                        {
                            id = a.Id,
                            code = a.Code,
                            name = a.Name,
                            description = a.Description
                        };
            int count = query.Count();
            //var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).AsNoTracking().ToList();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "code", "name", "description");
            return Json(jdata);
        }

        [HttpPost]
        public object Insert([FromBody]MaterialType data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                if (_context.MaterialTypes.FirstOrDefault(x => x.Code == data.Code && x.IsDeleted == false) == null)
                {
                    data.CreatedBy = ESEIM.AppContext.UserName;
                    data.CreatedTime = DateTime.Now;

                    _context.MaterialTypes.Add(data);
                    _context.SaveChanges();

                    msg.Title = String.Format(_sharedResources["COM_ADD_SUCCESS"], "");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["MT_MSG_CODE_EXIST"], "");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(_stringLocalizer["MATERIAL_MSG_ERR_ADD"));
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.MaterialTypes.FirstOrDefault(x => x.Id == id);
                data.IsDeleted = true;
                data.DeletedBy = ESEIM.AppContext.UserName;
                data.DeletedTime = DateTime.Now;

                _context.MaterialTypes.Update(data);
                _context.SaveChanges();

                msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"], "");
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(_stringLocalizer["COM_ERR_DELETE"));
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }
        [HttpPost]
        public object GetData(int id)
        {
            var data = _context.MaterialTypes.FirstOrDefault(x => x.Id == id);
            return Json(data);
        }

        [HttpPost]
        public object Update([FromBody]MaterialType data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                data.UpdatedBy = ESEIM.AppContext.UserName;
                data.UpdatedTime = DateTime.Now;
                _context.MaterialTypes.Update(data);
                _context.SaveChanges();

                msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"], "");
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = String.Format(_stringLocalizer["COM_UPDATE_FAIL"));
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public object GetAllData()
        {
            var data = _context.MaterialTypes.Where(x => !x.IsDeleted).Select(x => new { x.Id, x.Name }).AsNoTracking().ToList();
            return Json(data);
        }

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}