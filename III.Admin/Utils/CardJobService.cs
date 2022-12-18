using ESEIM.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ESEIM.Utils
{
    public interface ICardJobService
    {
        CardPercentCompleted UpdatePercentParentSubItem(string chkListCode);
        CardPercentCompleted UpdatePercentParentItem(string cardCode);
        CardPercentCompleted UpdatePercentParentCard(string cardCode);
        CardPercentCompleted UpdatePercentParentList(string listCode);
        CardMapping GetJobCardSuggest(string userName);
        decimal GetCompletedBoard(string boardCode, string objCode);
        decimal GetPercentJCObject(string objType, string objCode);
    }
    public class CardJobService : ICardJobService
    {
        private EIMDBContext _context;

        public CardJobService(EIMDBContext context)
        {
            _context = context;
        }

        public CardPercentCompleted UpdatePercentParentSubItem(string chkListCode)
        {
            var model = new CardPercentCompleted { };
            try
            {
                var completedSubitem = _context.CardSubitemChecks.Local.Where(x => x.ChkListCode == chkListCode && x.Flag == false).Count() != 0 ? (decimal)(_context.CardSubitemChecks.Local.Where(x => x.ChkListCode == chkListCode && x.Approve == true && x.Flag == false).Count() * 100) / (_context.CardSubitemChecks.Local.Where(x => x.ChkListCode == chkListCode && x.Flag == false).Count()) : 0;
                var getCheckItem = _context.CardItemChecks.FirstOrDefault(x => x.ChkListCode == chkListCode);
                if (getCheckItem != null)
                {
                    //update Item
                    getCheckItem.Completed = completedSubitem;
                    model.PercentCheckList = completedSubitem;
                    _context.CardItemChecks.Load();
                    //_context.SaveChanges();

                    var getCard = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == getCheckItem.CardCode && x.IsDeleted == false);
                    if (getCard != null)
                    {
                        //update Card
                        getCard.Completed = _context.CardItemChecks.Local.Where(x => x.CardCode == getCheckItem.CardCode && x.Flag == false).Select(x => new
                        {
                            Completed = (x.Completed * x.WeightNum) / 100
                        }).Sum(x => x.Completed);
                        model.PercentCard = getCard.Completed;

                        var progressTracking = new ProgressTracking
                        {
                            CardCode = getCard.CardCode,
                            Progress = getCard.Completed,
                            UpdatedBy = ESEIM.AppContext.UserName,
                            UpdatedTime = DateTime.Now
                        };
                        _context.ProgressTrackings.Add(progressTracking);

                        _context.WORKOSCards.Load();

                        //_context.SaveChanges();

                        //update List
                        var getList = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == getCard.ListCode && x.IsDeleted == false);
                        if (getList != null)
                        {
                            //getList.Completed += (getCard.Completed * getList.WeightNum) / 100;
                            var getAllCardInList = _context.WORKOSCards.Where(x => x.ListCode == getList.ListCode && !x.IsDeleted && x.Status != "TRASH" && x.Status != "CANCLED").ToList();
                            var weightNumUsed = getAllCardInList.Where(x => x.WeightNum > 0).Sum(x => x.WeightNum);
                            var weightNumNoUse = 100 - weightNumUsed;
                            var cardNoHasWeighNum = getAllCardInList.Where(x => x.WeightNum == 0);
                            var listCardNoWeighNumTemp = new List<WORKOSCard>();
                            listCardNoWeighNumTemp.AddRange(cardNoHasWeighNum);
                            if (cardNoHasWeighNum.Count() > 0)
                            {
                                foreach (var item in cardNoHasWeighNum)
                                {
                                    item.WeightNum = weightNumNoUse / cardNoHasWeighNum.Count();
                                }
                            }
                            getList.Completed = _context.WORKOSCards.Local.Where(x => x.ListCode == getCard.ListCode && x.IsDeleted == false && x.Status != "CANCLED" && x.Status != "TRASH").Select(x => new
                            {
                                Completed = (x.Completed * x.WeightNum) / 100
                            }).Sum(n => n.Completed);
                            model.PercentList = getList.Completed;
                            //gán lại trọng số của card chưa có trọng số
                            if (listCardNoWeighNumTemp.Count() > 0)
                            {
                                foreach (var item in listCardNoWeighNumTemp)
                                {
                                    item.WeightNum = 0;
                                }
                            }
                            _context.WORKOSLists.Load();
                            //_context.SaveChanges();

                            var getBoard = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == getList.BoardCode && x.IsDeleted == false);
                            if (getBoard != null)
                            {
                                //getBoard.Completed += getList.Completed;
                                var getAllListInBoard = _context.WORKOSLists.Where(x => x.BoardCode == getBoard.BoardCode && !x.IsDeleted);
                                var weightNumListUsed = getAllListInBoard.Where(x => x.WeightNum > 0).Sum(x => x.WeightNum);
                                var weightNumListNoUse = 100 - weightNumListUsed;
                                var listNoHasWeighNum = getAllListInBoard.Where(x => x.WeightNum == 0);
                                var listNoWeighNumTemp = new List<WORKOSList>();
                                listNoWeighNumTemp.AddRange(listNoHasWeighNum);
                                if (listNoHasWeighNum.Count() > 0)
                                {
                                    foreach (var item in listNoHasWeighNum)
                                    {
                                        item.WeightNum = weightNumListNoUse / listNoHasWeighNum.Count();
                                    }
                                }
                                getBoard.Completed = _context.WORKOSLists.Local.Where(x => x.BoardCode == getList.BoardCode && x.IsDeleted == false).Select(x => new
                                {
                                    Completed = (x.Completed * x.WeightNum) / 100
                                }).Sum(n => n.Completed);
                                model.PercentBoard = getBoard.Completed;

                                //gán lại trọng số của list
                                if (listNoWeighNumTemp.Count() > 0)
                                {
                                    foreach (var item in listNoWeighNumTemp)
                                    {
                                        item.WeightNum = 0;
                                    }
                                }
                                //_context.SaveChanges();
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }
            return model;
        }

        public CardPercentCompleted UpdatePercentParentItem(string cardCode)
        {
            var model = new CardPercentCompleted { };
            try
            {
                var getCard = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == cardCode && x.IsDeleted == false);
                if (getCard != null)
                {
                    //update Card
                    getCard.Completed = _context.CardItemChecks.Local.Where(x => x.CardCode == cardCode && x.Flag == false).Select(x => new
                    {
                        Completed = (x.Completed * x.WeightNum) / 100
                    }).Sum(x => x.Completed);
                    model.PercentCard = getCard.Completed;
                    var progressTracking = new ProgressTracking
                    {
                        CardCode = getCard.CardCode,
                        Progress = getCard.Completed,
                        UpdatedBy = ESEIM.AppContext.UserName,
                        UpdatedTime = DateTime.Now
                    };
                    _context.ProgressTrackings.Add(progressTracking);

                    _context.WORKOSCards.Load();

                    //_context.SaveChanges();

                    //update List
                    var getList = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == getCard.ListCode && x.IsDeleted == false);
                    if (getList != null)
                    {
                        //getList.Completed += (getCard.Completed * getList.WeightNum) / 100;
                        getList.Completed = _context.WORKOSCards.Local.Where(x => x.ListCode == getCard.ListCode && x.IsDeleted == false && x.Status != "TRASH" && x.Status != "CANCLED").Select(x => new
                        {
                            Completed = (x.Completed * x.WeightNum) / 100
                        }).Sum(n => n.Completed);
                        model.PercentList = getList.Completed;
                        _context.WORKOSLists.Load();
                        //_context.SaveChanges();

                        var getBoard = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == getList.BoardCode && x.IsDeleted == false);
                        if (getBoard != null)
                        {
                            //getBoard.Completed += getList.Completed;
                            getBoard.Completed = _context.WORKOSLists.Local.Where(x => x.BoardCode == getList.BoardCode && x.IsDeleted == false).Select(x => new
                            {
                                Completed = (x.Completed * x.WeightNum) / 100
                            }).Sum(n => n.Completed);
                            model.PercentBoard = getBoard.Completed;
                            //_context.SaveChanges();
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }
            return model;
        }

        public CardPercentCompleted UpdatePercentParentCard(string cardCode)
        {
            var model = new CardPercentCompleted { };
            try
            {
                var getCard = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == cardCode && x.IsDeleted == false);
                if (getCard != null)
                {
                    //update Card
                    getCard.Completed = _context.CardItemChecks.Where(x => x.CardCode == cardCode && x.Flag == false).Select(x => new
                    {
                        Completed = (x.Completed * x.WeightNum) / 100
                    }).Sum(x => x.Completed);
                    model.PercentCard = getCard.Completed;

                    var progressTracking = new ProgressTracking
                    {
                        CardCode = getCard.CardCode,
                        Progress = getCard.Completed,
                        UpdatedBy = ESEIM.AppContext.UserName,
                        UpdatedTime = DateTime.Now
                    };
                    _context.ProgressTrackings.Add(progressTracking);
                    //_context.SaveChanges();
                    _context.WORKOSCards.Load();


                    //update List
                    var getList = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == getCard.ListCode && x.IsDeleted == false);
                    if (getList != null)
                    {
                        var getAllCardInList = _context.WORKOSCards.Where(x => x.ListCode == getList.ListCode && !x.IsDeleted && x.Status != "TRASH" && x.Status != "CANCLED").ToList();
                        var weightNumUsed = getAllCardInList.Where(x => x.WeightNum > 0).Sum(x => x.WeightNum);
                        var weightNumNoUse = 100 - weightNumUsed;
                        var cardNoHasWeighNum = getAllCardInList.Where(x => x.WeightNum == 0).ToList();
                        var listCardNoWeighNumTemp = new List<WORKOSCard>();
                        listCardNoWeighNumTemp.AddRange(cardNoHasWeighNum);
                        if (cardNoHasWeighNum.Count() > 0)
                        {
                            foreach (var item in cardNoHasWeighNum)
                            {
                                item.WeightNum = weightNumNoUse / cardNoHasWeighNum.Count();
                            }
                        }
                        getList.Completed = _context.WORKOSCards.Local.Where(x => x.ListCode == getCard.ListCode && x.IsDeleted == false && x.Status != "TRASH" && x.Status != "CANCLED").Select(x => new
                        {
                            Completed = (x.Completed * x.WeightNum) / 100
                        }).Sum(n => n.Completed);
                        model.PercentList = getList.Completed;
                        //gán lại trọng số của card chưa có trọng số
                        if (listCardNoWeighNumTemp.Count() > 0)
                        {
                            foreach (var item in listCardNoWeighNumTemp)
                            {
                                if (item.CardCode != cardCode)
                                {
                                    item.WeightNum = 0;
                                }
                            }
                        }
                        //_context.SaveChanges();
                        _context.WORKOSLists.Load();


                        var getBoard = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == getList.BoardCode && x.IsDeleted == false);
                        if (getBoard != null)
                        {
                            //getBoard.Completed += getList.Completed;
                            var getAllListInBoard = _context.WORKOSLists.Where(x => x.BoardCode == getBoard.BoardCode && !x.IsDeleted);
                            var weightNumListUsed = getAllListInBoard.Where(x => x.WeightNum > 0).Sum(x => x.WeightNum);
                            var weightNumListNoUse = 100 - weightNumListUsed;
                            var listNoHasWeighNum = getAllListInBoard.Where(x => x.WeightNum == 0);
                            var listNoWeighNumTemp = new List<WORKOSList>();
                            listNoWeighNumTemp.AddRange(listNoHasWeighNum);
                            if (listNoHasWeighNum.Count() > 0)
                            {
                                foreach (var item in listNoHasWeighNum)
                                {
                                    item.WeightNum = weightNumListNoUse / listNoHasWeighNum.Count();
                                }
                            }

                            getBoard.Completed = _context.WORKOSLists.Local.Where(x => x.BoardCode == getList.BoardCode && x.IsDeleted == false).Select(x => new
                            {
                                Completed = (x.Completed * x.WeightNum) / 100
                            }).Sum(n => n.Completed);
                            model.PercentBoard = getBoard.Completed;
                            //gán lại trọng số của list
                            if (listNoWeighNumTemp.Count() > 0)
                            {
                                foreach (var item in listNoWeighNumTemp)
                                {
                                    item.WeightNum = 0;
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {

            }
            return model;
        }

        public CardPercentCompleted UpdatePercentParentList(string listCode)
        {
            var model = new CardPercentCompleted { };
            try
            {
                //update List
                var getList = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == listCode && x.IsDeleted == false);
                if (getList != null)
                {
                    //getList.Completed += (getCard.Completed * getList.WeightNum) / 100;
                    getList.Completed = _context.WORKOSCards.Where(x => x.ListCode == listCode && x.IsDeleted == false && x.Status != "TRASH" && x.Status != "CANCLED").Select(x => new
                    {
                        Completed = (x.Completed * x.WeightNum) / 100
                    }).Sum(n => n.Completed);
                    _context.WORKOSLists.Load();
                    //_context.SaveChanges();

                    var getBoard = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == getList.BoardCode && x.IsDeleted == false);
                    if (getBoard != null)
                    {
                        //getBoard.Completed += getList.Completed;
                        getBoard.Completed = _context.WORKOSLists.Local.Where(x => x.BoardCode == getList.BoardCode && x.IsDeleted == false).Select(x => new
                        {
                            Completed = (x.Completed * x.WeightNum) / 100
                        }).Sum(n => n.Completed);
                        //_context.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {

            }
            return model;
        }

        public CardMapping GetJobCardSuggest(string userName)
        {
            return _context.CardMappings.Where(x => x.CreatedBy == userName).MaxBy(x => x.CreatedTime);
        }

        public decimal GetCompletedBoard(string boardCode, string objCode)
        {
            //Get board
            var getBoard = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == boardCode && !x.IsDeleted);
            getBoard.Completed = 0;
            //Get List in board
            var lists = _context.WORKOSLists.Where(x => x.BoardCode == getBoard.BoardCode && !x.IsDeleted).ToList();
            //Get list has weight num
            var listWeightNum = lists.Where(x => x.WeightNum > 0).ToList();
            //Get list has not weight num
            var listNoWeightNum = lists.Where(x => x.WeightNum == 0).ToList();
            //Caculate weight num no use
            var listWeightNoUse = 100 - (listWeightNum.Sum(x => x.WeightNum));
            //Set weight num to list has not weight num
            if (listNoWeightNum.Any())
            {
                foreach (var list in listNoWeightNum)
                {
                    list.WeightNum = listWeightNoUse / (listNoWeightNum.Count());
                }
            }

            //Iterator lists list
            foreach (var list in lists)
            {
                list.Completed = 0;
                //Get all card in list and belongs to project
                var cards = (from a in _context.WORKOSCards.Where(x => x.ListCode == list.ListCode && !x.IsDeleted && x.Status != "TRASH" && x.Status != "CANCLED")
                             join b in _context.JcObjectIdRelatives.Where(x => x.ObjID == objCode && !x.IsDeleted) on a.CardCode equals b.CardCode
                             select new Wei
                             {
                                 Completed = a.Completed,
                                 WeightNum = a.WeightNum
                             }).ToList();

                //Get card has weight num
                var cardWeightNum = cards.Where(x => x.WeightNum > 0).ToList();
                //Get card has not weight num
                var cardNoWeightNum = cards.Where(x => x.WeightNum == 0).ToList();
                //Caculate weight num no used
                var weightNum = 100 - cardWeightNum.Sum(x => x.WeightNum);
                //Set weight num to card has not weight num
                if (cardNoWeightNum.Any())
                {
                    foreach (var card in cardNoWeightNum)
                    {
                        card.WeightNum = weightNum / cardNoWeightNum.Count();
                    }
                }

                //Caculate completed list
                foreach (var card in cards)
                {
                    list.Completed += ((card.Completed * card.WeightNum) / 100);
                }
                //Caculate completed board
                getBoard.Completed = ((list.Completed * list.WeightNum) / 100);
            }
            return getBoard.Completed;
        }

        public decimal GetPercentJCObject(string ObjTypeCode, string ObjID)
        {
            //update List
            decimal percentObject = 0;
            var getListObjectIdRelatives = (from a in _context.JcObjectIdRelatives.Where(x => x.ObjTypeCode == ObjTypeCode && !x.IsDeleted && x.ObjID == ObjID)
                                            join b in _context.WORKOSCards.Where(x => !x.IsDeleted && x.Status != "TRASH" && x.Status != "CANCLED") on a.CardCode equals b.CardCode
                                            select new WeiJC
                                            {
                                                CardCode = a.CardCode,
                                                Weight = a.Weight != null ? a.Weight : 0,
                                            }).ToList();
            if (getListObjectIdRelatives.Count() > 0)
            {
                var weightNumListUsed = getListObjectIdRelatives.Where(x => x.Weight > 0).Sum(x => x.Weight.Value);
                var weightNumListNoUse = 100 - weightNumListUsed;
                var listNoHasWeighNum = getListObjectIdRelatives.Where(x => x.Weight == 0).ToList();
                if (listNoHasWeighNum.Count() > 0)
                {
                    foreach (var item in listNoHasWeighNum)
                    {
                        item.Weight = weightNumListNoUse / listNoHasWeighNum.Count();
                    }
                }
                var jcCards = (from a in getListObjectIdRelatives
                               join b in _context.WORKOSCards.Where(x => !x.IsDeleted) on a.CardCode equals b.CardCode
                               select new Wei
                               {
                                   WeightNum = a.Weight.Value,
                                   Completed = b.Completed
                               }).ToList();
                foreach (var item in jcCards)
                {
                    percentObject += ((item.WeightNum * item.Completed) / 100);
                }
            }
            return Convert.ToDecimal(String.Format("{0:0.00}", percentObject));
        }
    }

    public class CardPercentCompleted
    {
        public decimal PercentCheckList { get; set; }
        public decimal PercentCard { get; set; }
        public decimal PercentList { get; set; }
        public decimal PercentBoard { get; set; }
    }
    public class Wei
    {
        public decimal WeightNum { get; set; }
        public decimal Completed { get; set; }
    }
    public class WeiJC
    {
        public string CardCode { get; set; }
        public decimal? Weight { get; set; }
    }
}
