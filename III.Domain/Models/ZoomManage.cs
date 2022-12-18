using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("ZOOM_MANAGE")]
    public class  ZoomManage
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string ZoomId { get; set; }

        public string ZoomName { get; set; }

        public string ZoomPassword { get; set; }

        public string Note { get; set; }

        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        public string AccountZoom { get; set; }
        public string Group { get; set; }
        public string ListUserAccess { get; set; }
    }
}