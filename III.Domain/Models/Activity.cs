using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ACTIVITY")]
    public class Activity
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string ActCode { get; set; }
        public string ActName { get; set; }
        public string ActNoted { get; set; }
        public string ActParent { get; set; }

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
