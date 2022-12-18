using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ACTIVITY_ATTR_SETUP")]
    public class ActivityAttrSetup
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        [StringLength(100)]
        public string ActCode { get; set; }

        [StringLength(100)]
        public string AttrCode { get; set; }

        [StringLength(100)]
        public string AttrName { get; set; }

        [StringLength(100)]
        public string AttrDataType { get; set; }

        [StringLength(100)]
        public string AttrUnit { get; set; }

        [StringLength(255)]
        public string AttrGroup { get; set; }

        [StringLength(1000)]
        public string Note { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }

        [StringLength(100)]
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }

        [StringLength(100)]
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }

      
    }
}
