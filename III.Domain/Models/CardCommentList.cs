using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CARD_COMMENT_LIST")]
    public class CardCommentList
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string CardCode { get; set; }

        [StringLength(255)]
        public string CmtId { get; set; }

        [StringLength(255)]
        public string CmtContent { get; set; }

        [StringLength(255)]
        public string MemberId { get; set; }

        public DateTime? CreatedTime { get; set; }
        public DateTime? UpdatedTime { get; set; }

        [StringLength(255)]
        public string UpdatedBy { get; set; }

        public bool Flag { get; set; }
    }
}
