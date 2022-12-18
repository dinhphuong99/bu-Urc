using Lucene.Net.Analysis.Standard;
using Lucene.Net.Documents;
using Lucene.Net.Index;
using Lucene.Net.QueryParsers.Classic;
using Lucene.Net.Search;
using Lucene.Net.Search.Highlight;
using Lucene.Net.Store;
using Lucene.Net.Util;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace ESEIM.Utils
{
    public static class LuceneExtension
    {
        public static string[] fileMimetypes = { "text/plain", "application/vnd.ms-powerpoint", "application/msword", "application/x-pdf", "application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "image/png", "image/x-png", "image/jpeg", "image/gif", "image/pjpeg", "image/tiff", "image/tiff", "application/x-zip-compressed", "application/octet-stream" };
        public static string[] fileExt = { ".TXT", ".DOC", ".DOCX", ".PDF", ".PPS", ".PPT", ".PPTX", ".PNG", ".JPG", ".TIF", ".TIFF", ".XLSM", ".XLSX", ".XLSB", ".XLTX", ".XLTM", ".XLS", ".XLT", ".ZIP", ".RAR",".JPEG" };

        private static string[] fileLuceneMimetypes = { "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/msword",
            "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/pdf",
            "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain"};
        private static string[] fileLucene = { ".DOC", ".DOCX", ".TXT", ".PDF", ".XLSX", ".XLS", ".PPS", ".PPT", ".PPTX" };
        public static void IndexFile(string fileCode, IFormFile fileUpload, string pathIndex)
        {
            try
            {
                var fileType = fileUpload.ContentType;
                string extension = Path.GetExtension(fileUpload.FileName);
                if (Array.IndexOf(fileLuceneMimetypes, fileType) >= 0 && (Array.IndexOf(fileLucene, extension.ToUpper()) >= 0))
                {
                    LuceneVersion MatchVersion = LuceneVersion.LUCENE_48;
                    Lucene.Net.Store.Directory directory = FSDirectory.Open(new DirectoryInfo(pathIndex));
                    var oAnalyzer = new StandardAnalyzer(MatchVersion);
                    if (IndexWriter.IsLocked(directory))
                    {
                        IndexWriter.Unlock(directory);
                    }
                    var oIndexWriterConfig = new IndexWriterConfig(MatchVersion, oAnalyzer);
                    var oIndexWriter = new IndexWriter(directory, oIndexWriterConfig);
                    Document doc = new Document();
                    string[] txtMimetypes = { "text/plain" };
                    string[] wordMimetypes = { "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/msword" };
                    string[] excelMimetypes = { "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
                    string[] pdfMimetypes = { "application/pdf" };
                    string[] powerPointMimetypes = { "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation" };


                    string[] word = { ".DOC", ".DOCX" };
                    string[] pdf = { ".PDF" };
                    string[] txt = { ".TXT" };
                    string[] excel = { ".XLSX", ".XLS" };
                    string[] powerPoint = { ".PPS", ".PPT", ".PPTX" };

                    if (Array.IndexOf(txtMimetypes, fileType) >= 0 && (Array.IndexOf(txt, extension.ToUpper()) >= 0))
                    {
                        string content = FileExtensions.ExtractTextTxt(fileUpload);
                        doc.Add(new TextField("Content", content, Field.Store.YES));
                    }
                    else if (Array.IndexOf(wordMimetypes, fileType) >= 0 && (Array.IndexOf(word, extension.ToUpper()) >= 0))
                    {
                        string content = FileExtensions.ExtractTextWord(fileUpload);
                        doc.Add(new TextField("Content", content, Field.Store.YES));
                    }
                    else if (Array.IndexOf(pdfMimetypes, fileType) >= 0 && (Array.IndexOf(pdf, extension.ToUpper()) >= 0))
                    {
                        string content = FileExtensions.ExtractTextPdf(fileUpload);
                        doc.Add(new TextField("Content", content, Field.Store.YES));
                    }
                    else if (Array.IndexOf(excelMimetypes, fileType) >= 0 && (Array.IndexOf(excel, extension.ToUpper()) >= 0))
                    {
                        string content = FileExtensions.ExtractTextExcel(fileUpload);
                        doc.Add(new TextField("Content", content, Field.Store.YES));
                    }
                    else if (Array.IndexOf(powerPointMimetypes, fileType) >= 0 && (Array.IndexOf(powerPoint, extension.ToUpper()) >= 0))
                    {
                        string content = FileExtensions.ExtractTextPowerPoint(fileUpload);
                        doc.Add(new TextField("Content", content, Field.Store.YES));
                    }
                    doc.Add(new Field("FileCode", fileCode, Field.Store.YES, Field.Index.NOT_ANALYZED));
                    //doc.Add(field);
                    //doc.Add(new TextField("FileName", file.FileName, Field.Store.YES));
                    //doc.Add(new TextField("FileTypePhysic", file.FileTypePhysic, Field.Store.YES));
                    //doc.Add(new TextField("Url", file.Url, Field.Store.YES));
                    oIndexWriter.AddDocument(doc);
                    oIndexWriter.Flush(true, true);
                    oIndexWriter.DeleteUnusedFiles();
                    oIndexWriter.Dispose();
                }
            }
            catch (Exception ex)
            {
            }
        }
        public static void DeleteIndexFile(string fileCode, string pathIndex)
        {
            LuceneVersion MatchVersion = LuceneVersion.LUCENE_48;
            Lucene.Net.Store.Directory directory = FSDirectory.Open(new DirectoryInfo(pathIndex));
            var oAnalyzer = new StandardAnalyzer(MatchVersion);
            if (IndexWriter.IsLocked(directory))
            {
                IndexWriter.Unlock(directory);
            }
            var oIndexWriterConfig = new IndexWriterConfig(MatchVersion, oAnalyzer);
            var oIndexWriter = new IndexWriter(directory, oIndexWriterConfig);
            Query docFileCode = new TermQuery(new Term("FileCode", fileCode));
            oIndexWriter.DeleteDocuments(docFileCode);
            oIndexWriter.Flush(true, true);
            oIndexWriter.Dispose();
        }
        public static (IEnumerable<EDMSJtableFileModel>, int) SearchHighligh(string input, string pathIndex, int page, int length, string fieldName = "")
        {
            //var terms = input.Trim().Replace("-", " ").Split(' ')
            //    .Where(x => !string.IsNullOrEmpty(x)).Select(x => x.Trim() + "*");
            //input = string.Join(" ", terms);

            return _searchHighligh(input, pathIndex, page, length, fieldName);
        }
        private static string _getHighlight(Highlighter highlighter, StandardAnalyzer analyzer, string fieldContent)
        {
            Lucene.Net.Analysis.TokenStream stream = analyzer.GetTokenStream("", new StringReader(fieldContent));
            return highlighter.GetBestFragments(stream, fieldContent, 1, ".");
        }
        private static (IEnumerable<EDMSJtableFileModel>, int) _searchHighligh(string searchQuery, string pathIndex, int page, int length, string searchField = "")
        {
            // validation
            //if (string.IsNullOrEmpty(searchQuery.Replace("*", "").Replace("?", ""))) return new List<EDMSJtableFileModel>();

            // set up lucene searcher
            Lucene.Net.Store.Directory directory = FSDirectory.Open(new DirectoryInfo(pathIndex));
            IndexReader indexReader = DirectoryReader.Open(directory);
            if (IndexWriter.IsLocked(directory))
            {
                IndexWriter.Unlock(directory);
            }
            var searcher = new IndexSearcher(indexReader);
            LuceneVersion MatchVersion = LuceneVersion.LUCENE_48;
            var analyzer = new StandardAnalyzer(MatchVersion);

            IFormatter formatter = new SimpleHTMLFormatter("<span style=\"font-weight:bold; background-color: yellow;\">", "</span>");
            SimpleFragmenter fragmenter = new SimpleFragmenter(200);
            QueryScorer scorer = null;

            ScoreDoc[] hits;
            var hitLimit = 1000;
            // search by single field
            if (!string.IsNullOrEmpty(searchField))
            {
                var parser = new QueryParser(MatchVersion, searchField, analyzer);
                var query = parser.Parse(searchQuery);
                scorer = new QueryScorer(query);
                hits = searcher.Search(query, hitLimit).ScoreDocs;
            }
            //// search by multiple fields (ordered by RELEVANCE)
            else
            {
                var parser = new MultiFieldQueryParser
                    (MatchVersion, new[] { "Content" }, analyzer);
                var query = parser.Parse(searchQuery);

                scorer = new QueryScorer(query);
                hits = searcher.Search(query, null, hitLimit, Sort.INDEXORDER).ScoreDocs;
            }
            var highlighter = new Highlighter(formatter, scorer);
            highlighter.TextFragmenter = fragmenter;
            //var pageHits = hits.Skip(page).Take(length);
            var results = _mapLuceneToDataListHighligh(hits, searcher, highlighter, analyzer);
            analyzer.Dispose();
            return (results, hits.Length);
        }
        private static IEnumerable<EDMSJtableFileModel> _mapLuceneToDataListHighligh(IEnumerable<ScoreDoc> hits, IndexSearcher searcher, Highlighter highlighter, StandardAnalyzer analyzer)
        {
            return hits.Select(hit => _mapLuceneDocumentToDataHighligh(searcher.Doc(hit.Doc), highlighter, analyzer)).ToList();
        }
        private static IEnumerable<EDMSJtableFileModel> _mapLuceneToDataListHighlighByFileCode(IEnumerable<ScoreDoc> hits, IndexSearcher searcher, string fileCode)
        {
            return hits.Select(hit => _mapLuceneDocumentToDataHighlighByFileCode(searcher.Doc(hit.Doc))).ToList();
        }
        private static EDMSJtableFileModel _mapLuceneDocumentToDataHighligh(Document doc, Highlighter highlighter, StandardAnalyzer analyzer)
        {
            return new EDMSJtableFileModel
            {
                FileCode = doc.Get("FileCode"),
                Line = doc.Get("Line"),
                Page = doc.Get("Page"),
                Content = _getHighlight(highlighter, analyzer, doc.Get("Content")),
                //Content = _getHighlight(highlighter, analyzer, doc.Get("Content")) + " (<u>Dòng: " + doc.Get("Line") + (doc.Get("Page") != "-1" ? ", Trang: " + doc.Get("Page") : "") + "Session: " + doc.Get("Session") + "Phara: " + doc.Get("Phara") + "</u>) ",
            };
        }

        private static EDMSJtableFileModel _mapLuceneDocumentToDataHighlighByFileCode(Document doc)
        {
            return new EDMSJtableFileModel
            {
                FileCode = doc.Get("FileCode"),
                Line = doc.Get("Line"),
                Page = doc.Get("Page"),
                Content = doc.Get("Content"),
            };
        }

        public static IEnumerable<EDMSJtableFileModel> SearchHighlighByFileCode(string fileCode, string content, string pathIndex, string searchField = "")
        {
            Lucene.Net.Store.Directory directory = FSDirectory.Open(new DirectoryInfo(pathIndex));
            IndexReader indexReader = DirectoryReader.Open(directory);
            if (IndexWriter.IsLocked(directory))
            {
                IndexWriter.Unlock(directory);
            }
            var searcher = new IndexSearcher(indexReader);
            LuceneVersion MatchVersion = LuceneVersion.LUCENE_48;
            var analyzer = new StandardAnalyzer(MatchVersion);

            IFormatter formatter = new SimpleHTMLFormatter("<span style=\"font-weight:bold;\">", "</span>");
            SimpleFragmenter fragmenter = new SimpleFragmenter(200);
            QueryScorer scorer = null;

            ScoreDoc[] hits;
            var hitLimit = 500;
            // search by single field
            if (!string.IsNullOrEmpty(searchField))
            {
                var parser = new QueryParser(MatchVersion, searchField, analyzer);
                var query = parser.Parse(content);
                scorer = new QueryScorer(query);
                hits = searcher.Search(query, hitLimit).ScoreDocs;
            }
            //// search by multiple fields (ordered by RELEVANCE)
            else
            {
                var parser = new MultiFieldQueryParser
                    (MatchVersion, new[] { "Content" }, analyzer);
                var query = parser.Parse(content);

                scorer = new QueryScorer(query);
                hits = searcher.Search(query, null, hitLimit, Sort.INDEXORDER).ScoreDocs;
            }
            var highlighter = new Highlighter(formatter, scorer);
            highlighter.TextFragmenter = fragmenter;
            //var pageHits = hits.Skip(page).Take(length);
            var results = _mapLuceneToDataListHighlighByFileCode(hits, searcher, fileCode);
            var results1 = results.Where(x => x.FileCode == fileCode).ToList();
            analyzer.Dispose();
            return results1;
        }
    }
    public class LineModel
    {
        public LineModel()
        {
            Page = "-1";
        }
        public string Content { get; set; }
        public string Line { get; set; }
        public string Page { get; set; }
        public string Phara { get; set; }
        public string Session { get; set; }
    }
}
