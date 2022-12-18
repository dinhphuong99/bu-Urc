﻿using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Data;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CMSLinkController : BaseController
    {
        public class CMSLinksJtableViewModel
        {
            public bool? publish { get; set; }
            public int? ordering { get; set; }
            public DateTime? created_date { get; set; }
            public DateTime? modified_date { get; set; }
            public int id { get; set; }
            public string Title { get; set; }
            public string LinkRef { get; set; }
            public bool? trash { get; set; }

        }
        public class CMSLinksJtablePostModel : CMSLinksJtableViewModel
        {

        }
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<CMSLinkController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public CMSLinkController(EIMDBContext context, IStringLocalizer<CMSLinkController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }
        public IActionResult Index()
        {
            return View();
        }

        public class CMSLinkJTableModel : JTableModel
        {
            public string trash { get; set; }
            public string publish { get; set; }
        }

        #region combobox

        //[HttpPost]
        //public object GetUser()
        //{
        //    var query = _context.Users.Where(x => x.Active == true && x.UserType != 10).Select(x => new { x.Id, x.GivenName }).AsNoTracking().ToList();
        //    return query;
        //}

        //[HttpPost]
        //public object GetCurrency()
        //{
        //    var data = _context.FundCurrencys.Select(x => new { Code = x.CurrencyCode, Name = x.Note }).AsNoTracking().ToList();
        //    return data;
        //}
        #endregion
        #region action
        [HttpPost]
        public object JTable([FromBody]CMSLinkJTableModel jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.cms_extra_fields_value
                         join g in _context.cms_extra_fields_groups
                         on a.field_group equals g.id
                         //where ((string.IsNullOrEmpty(jTablePara.trash) || (a.trash.ToLower().Contains(jTablePara.trash.ToLower()))))
                         //&& ((string.IsNullOrEmpty(jTablePara.publish) || (a.publish.ToLower().Contains(jTablePara.publish.ToLower()))))
                         where (g.id == 5)
                         &&(string.IsNullOrEmpty(jTablePara.trash) || (Convert.ToBoolean(jTablePara.trash) == a.trash))
                         && (string.IsNullOrEmpty(jTablePara.publish) || (Convert.ToBoolean(jTablePara.publish)== a.publish))
                         select new CMSLinksJtableViewModel
                         {
                             id = a.id,
                             Title = JObject.Parse(a.field_value)["Title"].ToString(),
                             LinkRef = JObject.Parse(a.field_value)["LinkRef"].ToString(),
                             publish = a.publish,
                             ordering = a.ordering,
                             created_date = a.created_date,
                             modified_date = a.modified_date,
                             trash = a.trash
                         }).ToList();
            int count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length);
            //var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "Title", "id", "LinkRef", "publish", "ordering", "created_date", "trash", "modified_date");
            return Json(jdata);
        }

        [HttpPost]
        public object GetItem([FromBody]int id)
        {
            var data = _context.cms_extra_fields_value.FirstOrDefault(x => x.id == id);
            try
            {
                var obj = new CMSLinksJtableViewModel
                {
                    id = data.id,
                    Title = JObject.Parse(data.field_value)["Title"] == null ? "" : JObject.Parse(data.field_value)["Title"].ToString(),
                    LinkRef = JObject.Parse(data.field_value)["LinkRef"] == null ? "" : JObject.Parse(data.field_value)["LinkRef"].ToString(),
                    publish = data.publish,
                    ordering = data.ordering,
                    trash = data.trash,
                };
                return obj;
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpPost]
        public object GetCMSBlock()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "CMS_BLOCK").Select(x => new { Code = x.CodeSet, Name = x.ValueSet }).ToList();
            return data;

        }

        [HttpPost]
        public object Insert([FromBody]CMSLinksJtablePostModel data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var query = (from a in _context.cms_extra_fields_value
                             where (a.field_group == 5)
                              && (JObject.Parse(a.field_value)["LinkRef"].ToString() == data.LinkRef)
                             select a
                            ).ToList();
                if (query.Count != 0)
                {
                    msg.Error = true;
                    //msg.Title = "Link liên kết này đã tồn tại";
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["CMS_LINK_CURD_LBL_LINK"]);

                }
                else
                {
                    JObject json = new JObject();

                    json.Add("Title", data.Title);
                    json.Add("LinkRef", data.LinkRef);

                    var obj = new cms_extra_fields_value
                    {
                        field_value = json.ToString(),
                        field_group = 5,
                        ordering = data.ordering,
                        publish = data.publish,
                        created_date = DateTime.Now,
                        trash = true,
                    };
                    _context.cms_extra_fields_value.Add(obj);
                    _context.SaveChanges();
                   // msg.Title = "Thêm mới thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["CMS_LINK_CURD_LBL_LINK"]);

                }
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];

                return msg;
            }

        }

        [HttpPost]
        public JsonResult Update([FromBody]CMSLinksJtablePostModel data)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                JObject json = new JObject();
                cms_extra_fields_value value = _context.cms_extra_fields_value.FirstOrDefault(x => x.id == data.id);
                json.Add("Title", data.Title);
                json.Add("LinkRef", data.LinkRef);
                value.publish = data.publish;
                value.ordering = data.ordering;
                value.field_value = json.ToString();
                value.modified_date = DateTime.Now;
                _context.cms_extra_fields_value.Update(value);
                //_context.Entry(data).State = EntityState.Modified;
                var a = _context.SaveChanges();
                //msg.Title = "Cập nhật thành công!";
                msg.Title =_sharedResources["COM_UPDATE_SUCCESS"];

                msg.Error = false;
            }
            catch (Exception ex)
            {

                msg.Error = true;
                msg.Object = ex;
                //msg.Title = "Có lỗi khi cập nhật khoản mục";
                msg.Title = _sharedResources["COM_MSG_ERR"];

            }
            return Json(msg);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            var query = _context.cms_extra_fields_value.FirstOrDefault(x => x.id == id);
            if (query == null)
            {
                msg.Error = true;
                //msg.Title = "Link liên kiết không tồn tại";
                msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["CMS_LINK_CURD_LBL_LINK"]);

            }
            else
            {
                _context.cms_extra_fields_value.Remove(query);
                _context.SaveChanges();
                //msg.Title = "Xóa thành công";
                msg.Title =_sharedResources["COM_DELETE_SUCCESS"];

            }
            return msg;
        }
        public object Publish(int id)
        {
            var msg = new JMessage() { Error = false };
            var query = _context.cms_extra_fields_value.FirstOrDefault(x => x.id == id);
            if (query == null)
            {
                msg.Error = true;
                //msg.Title = "Link liên kiết không tồn tại";
                msg.Title = String.Format(_sharedResources["COM_MSG_NOT_EXITS"], _stringLocalizer["CMS_LINK_CURD_LBL_LINK"]);

            }
            else
            {
                query.publish = !query.publish;
                _context.cms_extra_fields_value.Update(query);
                _context.SaveChanges();
                //msg.Title = "Xóa thành công";
                msg.Title = _sharedResources["COM_DELETE_SUCCESS"];

            }
            return msg;
        }




        #endregion
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}