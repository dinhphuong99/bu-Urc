//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("cms_tags_xref")]
    public class cms_tags_xref
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }
        public int tag_id { get; set; }
        public int item_id { get; set; }
    }
}
//namespace III.WebApp.Domain.DbContext
//{
//    using System;
//    using System.Collections.Generic;
    
//    public partial class cms_tags_xref
//    {
//        public int id { get; set; }
//        public int tag_id { get; set; }
//        public int item_id { get; set; }
//    }
//}