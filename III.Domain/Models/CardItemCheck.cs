using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CARD_ITEM_CHECK")]
    public class CardItemCheck
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string CardCode { get; set; }

        [StringLength(255)]
        public string CheckTitle { get; set; }

        [StringLength(255)]
        public string Status { get; set; }

        [StringLength(255)]
        public string MemberId { get; set; }

        public DateTime? Finishtime { get; set; }

        [StringLength(255)]
        public string ChkListCode { get; set; }

        public int Percent { get; set; }

        [Column(TypeName = "decimal(14,2)")]
        public decimal Completed { get; set; }

        public DateTime? CompletedTime { get; set; }

        public decimal? Cost { get; set; }

        public DateTime? Deadline { get; set; }

        [StringLength(255)]
        public string LocationText { get; set; }

        [StringLength(255)]
        public string LocationGps { get; set; }

        [StringLength(255)]
        public string Device { get; set; }

        public DateTime? BeginTime { get; set; }

        [Column(TypeName = "decimal(14,2)")]
        public decimal WeightNum { get; set; }

        public bool Flag { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime DeletedTime { get; set; }
    }
}
