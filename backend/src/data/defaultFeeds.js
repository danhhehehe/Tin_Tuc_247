const defaultFeedsBase = [
  // Nông nghiệp, lúa gạo trong nước và quốc tế
  {
    name: 'Báo Nông nghiệp - Trang chủ',
    url: 'https://nongnghiepmoitruong.vn/feed.rss',
    homepage: 'https://nongnghiepmoitruong.vn',
    category: 'nong-nghiep',
    priority: 6
  },
  {
    name: 'Báo Nông nghiệp - Nông nghiệp',
    url: 'https://nongnghiepmoitruong.vn/nong-nghiep.rss',
    homepage: 'https://nongnghiepmoitruong.vn',
    category: 'nong-nghiep',
    priority: 6
  },
  {
    name: 'Báo Nông nghiệp - Trồng trọt',
    url: 'https://nongnghiepmoitruong.vn/trong-trot.rss',
    homepage: 'https://nongnghiepmoitruong.vn',
    category: 'lua-gao',
    priority: 6
  },
  {
    name: 'Google News - Lúa gạo Việt Nam',
    url: 'https://news.google.com/rss/search?q=l%C3%BAa%20g%E1%BA%A1o%20Vi%E1%BB%87t%20Nam%20OR%20xu%E1%BA%A5t%20kh%E1%BA%A9u%20g%E1%BA%A1o&hl=vi&gl=VN&ceid=VN:vi',
    homepage: 'https://news.google.com',
    category: 'lua-gao',
    priority: 5
  },
  {
    name: 'Google News - Rice world market',
    url: 'https://news.google.com/rss/search?q=rice%20market%20agriculture%20OR%20global%20rice%20export&hl=en-US&gl=US&ceid=US:en',
    homepage: 'https://news.google.com',
    category: 'nong-nghiep-the-gioi',
    language: 'en',
    priority: 4
  },

  // Mới nhất, thời sự, thế giới
  {
    name: 'Tuổi Trẻ - Mới nhất',
    url: 'https://tuoitre.vn/home.rss',
    homepage: 'https://tuoitre.vn',
    category: 'moi-nhat',
    priority: 5
  },
  {
    name: 'VnExpress - Tin mới nhất',
    url: 'https://vnexpress.net/rss/tin-moi-nhat.rss',
    homepage: 'https://vnexpress.net',
    category: 'moi-nhat',
    priority: 5
  },
  {
    name: 'Dân trí - Tin mới nhất',
    url: 'https://dantri.com.vn/rss/home.rss',
    homepage: 'https://dantri.com.vn',
    category: 'moi-nhat',
    priority: 5
  },
  {
    name: 'Google News - Tin mới nhất Việt Nam',
    url: 'https://news.google.com/rss/search?q=tin%20m%E1%BB%9Bi%20nh%E1%BA%A5t%20Vi%E1%BB%87t%20Nam&hl=vi&gl=VN&ceid=VN:vi',
    homepage: 'https://news.google.com',
    category: 'moi-nhat',
    priority: 4
  },
  {
    name: 'Tuổi Trẻ - Thời sự',
    url: 'https://tuoitre.vn/thoi-su.rss',
    homepage: 'https://tuoitre.vn',
    category: 'thoi-su',
    priority: 4
  },
  {
    name: 'VnExpress - Thời sự',
    url: 'https://vnexpress.net/rss/thoi-su.rss',
    homepage: 'https://vnexpress.net',
    category: 'thoi-su',
    priority: 4
  },
  {
    name: 'Dân trí - Thời sự',
    url: 'https://dantri.com.vn/rss/thoi-su.rss',
    homepage: 'https://dantri.com.vn',
    category: 'thoi-su',
    priority: 4
  },
  {
    name: 'Google News - Thế giới',
    url: 'https://news.google.com/rss/search?q=th%E1%BA%BF%20gi%E1%BB%9Bi%20qu%E1%BB%91c%20t%E1%BA%BF%20m%E1%BB%9Bi%20nh%E1%BA%A5t&hl=vi&gl=VN&ceid=VN:vi',
    homepage: 'https://news.google.com',
    category: 'the-gioi',
    priority: 3
  },
  {
    name: 'BBC Tiếng Việt',
    url: 'https://feeds.bbci.co.uk/vietnamese/rss.xml',
    homepage: 'https://www.bbc.com/vietnamese',
    category: 'the-gioi',
    priority: 3
  },

  // Bóng đá, thể thao
  {
    name: 'Tuổi Trẻ - Thể thao',
    url: 'https://tuoitre.vn/the-thao.rss',
    homepage: 'https://tuoitre.vn',
    category: 'bong-da',
    priority: 4
  },
  {
    name: 'VnExpress - Thể thao',
    url: 'https://vnexpress.net/rss/the-thao.rss',
    homepage: 'https://vnexpress.net',
    category: 'bong-da',
    priority: 4
  },
  {
    name: 'Dân trí - Thể thao',
    url: 'https://dantri.com.vn/rss/the-thao.rss',
    homepage: 'https://dantri.com.vn',
    category: 'bong-da',
    priority: 4
  },
  {
    name: 'Google News - Thể thao',
    url: 'https://news.google.com/rss/search?q=th%E1%BB%83%20thao%20b%C3%B3ng%20%C4%91%C3%A1%20m%E1%BB%9Bi%20nh%E1%BA%A5t&hl=vi&gl=VN&ceid=VN:vi',
    homepage: 'https://news.google.com',
    category: 'bong-da',
    priority: 3
  },
  {
    name: 'Google News - Bóng đá Việt Nam',
    url: 'https://news.google.com/rss/search?q=b%C3%B3ng%20%C4%91%C3%A1%20Vi%E1%BB%87t%20Nam%20OR%20World%20Cup%202026&hl=vi&gl=VN&ceid=VN:vi',
    homepage: 'https://news.google.com',
    category: 'bong-da',
    priority: 4
  },

  // Công nghệ
  {
    name: 'Tuổi Trẻ - Công nghệ',
    url: 'https://tuoitre.vn/nhip-song-so.rss',
    homepage: 'https://tuoitre.vn',
    category: 'cong-nghe',
    priority: 4
  },
  {
    name: 'VnExpress - Số hóa',
    url: 'https://vnexpress.net/rss/so-hoa.rss',
    homepage: 'https://vnexpress.net',
    category: 'cong-nghe',
    priority: 4
  },
  {
    name: 'Dân trí - Công nghệ',
    url: 'https://dantri.com.vn/rss/cong-nghe.rss',
    homepage: 'https://dantri.com.vn',
    category: 'cong-nghe',
    priority: 4
  },
  {
    name: 'Google News - Khoa học Công nghệ',
    url: 'https://news.google.com/rss/search?q=khoa%20h%E1%BB%8Dc%20c%C3%B4ng%20ngh%E1%BB%87%20m%E1%BB%9Bi%20nh%E1%BA%A5t&hl=vi&gl=VN&ceid=VN:vi',
    homepage: 'https://news.google.com',
    category: 'cong-nghe',
    priority: 3
  },

  // Giao thông, an toàn lao động
  {
    name: 'Tuổi Trẻ - Xe & Giao thông',
    url: 'https://tuoitre.vn/xe.rss',
    homepage: 'https://tuoitre.vn',
    category: 'giao-thong',
    priority: 3
  },
  {
    name: 'Dân trí - Ô tô Xe máy',
    url: 'https://dantri.com.vn/rss/o-to-xe-may.rss',
    homepage: 'https://dantri.com.vn',
    category: 'giao-thong',
    priority: 3
  },
  {
    name: 'Google News - An toàn giao thông',
    url: 'https://news.google.com/rss/search?q=an%20to%C3%A0n%20giao%20th%C3%B4ng%20Vi%E1%BB%87t%20Nam&hl=vi&gl=VN&ceid=VN:vi',
    homepage: 'https://news.google.com',
    category: 'giao-thong',
    priority: 4
  },
  {
    name: 'Google News - An toàn lao động',
    url: 'https://news.google.com/rss/search?q=an%20to%C3%A0n%20lao%20%C4%91%E1%BB%99ng%20Vi%E1%BB%87t%20Nam%20OR%20tai%20n%E1%BA%A1n%20lao%20%C4%91%E1%BB%99ng&hl=vi&gl=VN&ceid=VN:vi',
    homepage: 'https://news.google.com',
    category: 'an-toan-lao-dong',
    priority: 5
  },

  // Khác
  {
    name: 'Tuổi Trẻ - Kinh doanh',
    url: 'https://tuoitre.vn/kinh-doanh.rss',
    homepage: 'https://tuoitre.vn',
    category: 'kinh-doanh',
    priority: 3
  },
  {
    name: 'VnExpress - Kinh doanh',
    url: 'https://vnexpress.net/rss/kinh-doanh.rss',
    homepage: 'https://vnexpress.net',
    category: 'kinh-doanh',
    priority: 3
  },
  {
    name: 'Dân trí - Kinh doanh',
    url: 'https://dantri.com.vn/rss/kinh-doanh.rss',
    homepage: 'https://dantri.com.vn',
    category: 'kinh-doanh',
    priority: 3
  },
  {
    name: 'Tuổi Trẻ - Sức khỏe',
    url: 'https://tuoitre.vn/suc-khoe.rss',
    homepage: 'https://tuoitre.vn',
    category: 'suc-khoe',
    priority: 3
  },
  {
    name: 'Dân trí - Sức khỏe',
    url: 'https://dantri.com.vn/rss/suc-khoe.rss',
    homepage: 'https://dantri.com.vn',
    category: 'suc-khoe',
    priority: 3
  },
  {
    name: 'Tuổi Trẻ - Khoa học',
    url: 'https://tuoitre.vn/khoa-hoc.rss',
    homepage: 'https://tuoitre.vn',
    category: 'khoa-hoc',
    priority: 3
  },
  {
    name: 'Dân trí - Khoa học',
    url: 'https://dantri.com.vn/rss/khoa-hoc.rss',
    homepage: 'https://dantri.com.vn',
    category: 'khoa-hoc',
    priority: 3
  }
,
  {
    name: 'Thi Truong Lua Gao',
    url: 'https://thitruongluagao.com/category/1/trang-chu',
    homepage: 'https://thitruongluagao.com',
    type: 'html-list',
    category: 'lua-gao',
    priority: 7,
    parserConfig: { requiresJs: true }
  },
  {
    name: 'Nguoi Lao Dong - Gia lua gao',
    url: 'https://tuoitre.vn/nld/gia-lua-gao.html',
    homepage: 'https://tuoitre.vn',
    type: 'html-list',
    category: 'lua-gao',
    priority: 6
  },
  {
    name: 'Lua Gao Viet',
    url: 'https://luagaoviet.com/',
    homepage: 'https://luagaoviet.com',
    type: 'html-list',
    category: 'lua-gao',
    priority: 6
  },
  {
    name: 'Hiep hoi Nganh hang Lua gao Viet Nam',
    url: 'https://www.luagaovietnam.vn/',
    homepage: 'https://www.luagaovietnam.vn',
    type: 'html-list',
    category: 'lua-gao',
    priority: 6
  },
  {
    name: 'Hiep hoi Luong thuc Viet Nam - Gao Viet',
    url: 'https://vietfood.org.vn/gao-viet/',
    homepage: 'https://vietfood.org.vn',
    type: 'html-list',
    category: 'lua-gao',
    priority: 6
  },
  {
    name: 'Dong Thap - San xuat va tieu thu lua gao',
    url: 'https://dongthap.gov.vn/tin-tuc/chi-tiet?id=7742453',
    homepage: 'https://dongthap.gov.vn',
    type: 'html-article',
    category: 'lua-gao',
    priority: 5
  },
  {
    name: 'Nong nghiep Moi truong - Gia lua tai Dong Thap',
    url: 'https://nongnghiepmoitruong.vn/gia-lua-tai-dong-thap-tag195603/',
    homepage: 'https://nongnghiepmoitruong.vn',
    type: 'html-list',
    category: 'lua-gao',
    priority: 6
  },
  {
    name: 'Bao Lam Dong - Giao thong Dong Thap',
    url: 'https://baolamdong.vn/dong-thap-phe-duyet-du-an-duong-dt877c-ket-noi-cao-toc-quy-mo-3550-ty-dong-450060.html',
    homepage: 'https://baolamdong.vn',
    type: 'html-article',
    category: 'giao-thong',
    priority: 2
  }
];

function googleNewsFeed(name, query, category, priority = 3, language = 'vi') {
  const hl = language === 'en' ? 'en-US' : 'vi';
  const gl = language === 'en' ? 'US' : 'VN';
  const ceid = language === 'en' ? 'US:en' : 'VN:vi';
  return {
    name,
    url: `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`,
    homepage: 'https://news.google.com',
    type: 'google-news',
    category,
    language,
    priority
  };
}

const supplementalGoogleFeeds = [
  ['Google News - Lua gao', 'lúa gạo', 'lua-gao', 5],
  ['Google News - Gia lua', 'giá lúa', 'lua-gao', 5],
  ['Google News - Gia gao', 'giá gạo', 'lua-gao', 5],
  ['Google News - Xuat khau gao', 'xuất khẩu gạo', 'lua-gao', 5],
  ['Google News - Gao Viet Nam', 'gạo Việt Nam', 'lua-gao', 5],
  ['Google News - Thi truong gao', 'thị trường gạo', 'lua-gao', 5],
  ['Google News - Rice export Vietnam', 'rice export Vietnam', 'lua-gao', 4, 'en'],
  ['Google News - Vietnam rice price', 'Vietnam rice price', 'lua-gao', 4, 'en'],
  ['Google News - Nong nghiep Viet Nam', 'nông nghiệp Việt Nam', 'nong-nghiep', 4],
  ['Google News - Nha nong', 'nhà nông sản xuất', 'nong-nghiep', 4],
  ['Google News - Trong trot', 'trồng trọt Việt Nam', 'nong-nghiep', 4],
  ['Google News - Chan nuoi', 'chăn nuôi Việt Nam', 'nong-nghiep', 4],
  ['Google News - Phan bon', 'phân bón nông nghiệp', 'nong-nghiep', 3],
  ['Google News - Nong san', 'nông sản Việt Nam', 'nong-nghiep', 3],
  ['Google News - Nong nghiep cong nghe cao', 'nông nghiệp công nghệ cao', 'nong-nghiep', 3],
  ['Google News - Thuy san', 'thủy sản nông nghiệp Việt Nam', 'nong-nghiep', 3],
  ['Google News - Global agriculture', 'global agriculture news', 'nong-nghiep-the-gioi', 4, 'en'],
  ['Google News - World grain market', 'world grain market', 'nong-nghiep-the-gioi', 4, 'en'],
  ['Google News - Food security', 'food security agriculture', 'nong-nghiep-the-gioi', 3, 'en'],
  ['Google News - Climate agriculture', 'climate change agriculture', 'nong-nghiep-the-gioi', 3, 'en'],
  ['Google News - USDA rice', 'USDA rice market', 'nong-nghiep-the-gioi', 3, 'en'],
  ['Google News - Bong da Viet Nam', 'bóng đá Việt Nam', 'bong-da', 4],
  ['Google News - V League', 'V-League bóng đá', 'bong-da', 4],
  ['Google News - World Cup 2026', 'World Cup 2026 football', 'bong-da', 4],
  ['Google News - Champions League', 'Champions League football', 'bong-da', 3],
  ['Google News - Ngoai hang Anh', 'Ngoại hạng Anh', 'bong-da', 3],
  ['Google News - Chuyen nhuong bong da', 'chuyển nhượng bóng đá', 'bong-da', 3],
  ['Google News - Doi tuyen Viet Nam', 'đội tuyển Việt Nam bóng đá', 'bong-da', 4],
  ['Google News - Thoi su Viet Nam', 'thời sự Việt Nam', 'thoi-su', 4],
  ['Google News - Chinh phu', 'Chính phủ Việt Nam', 'thoi-su', 3],
  ['Google News - Xa hoi', 'xã hội Việt Nam mới nhất', 'thoi-su', 3],
  ['Google News - Dia phuong', 'tin địa phương Việt Nam', 'thoi-su', 3],
  ['Google News - Chinh sach moi', 'chính sách mới Việt Nam', 'thoi-su', 3],
  ['Google News - Quoc hoi', 'Quốc hội Việt Nam', 'thoi-su', 3],
  ['Google News - Giao thong Viet Nam', 'giao thông Việt Nam', 'giao-thong', 4],
  ['Google News - Cao toc', 'cao tốc Việt Nam', 'giao-thong', 4],
  ['Google News - Tai nan giao thong', 'tai nạn giao thông', 'giao-thong', 4],
  ['Google News - Duong sat', 'đường sắt Việt Nam', 'giao-thong', 3],
  ['Google News - Hang khong', 'hàng không Việt Nam', 'giao-thong', 3],
  ['Google News - Ha tang giao thong', 'hạ tầng giao thông', 'giao-thong', 3],
  ['Google News - An toan lao dong', 'an toàn lao động', 'an-toan-lao-dong', 4],
  ['Google News - Tai nan lao dong', 'tai nạn lao động', 'an-toan-lao-dong', 4],
  ['Google News - Bao ho lao dong', 'bảo hộ lao động', 'an-toan-lao-dong', 3],
  ['Google News - Cong nhan nha may', 'công nhân nhà máy an toàn', 'an-toan-lao-dong', 3],
  ['Google News - Xay dung an toan', 'an toàn xây dựng lao động', 'an-toan-lao-dong', 3],
  ['Google News - Cong nghe Viet Nam', 'công nghệ Việt Nam', 'cong-nghe', 4],
  ['Google News - AI Viet Nam', 'AI Việt Nam', 'cong-nghe', 4],
  ['Google News - Tri tue nhan tao', 'trí tuệ nhân tạo', 'cong-nghe', 4],
  ['Google News - Chuyen doi so', 'chuyển đổi số Việt Nam', 'cong-nghe', 4],
  ['Google News - An ninh mang', 'an ninh mạng', 'cong-nghe', 3],
  ['Google News - Smartphone', 'smartphone công nghệ', 'cong-nghe', 3],
  ['Google News - Startup cong nghe', 'startup công nghệ Việt Nam', 'cong-nghe', 3],
  ['Google News - Semiconductor', 'semiconductor Vietnam technology', 'cong-nghe', 3, 'en'],
  ['Google News - Kinh doanh Viet Nam', 'kinh doanh Việt Nam', 'kinh-doanh', 4],
  ['Google News - Tai chinh', 'tài chính Việt Nam', 'kinh-doanh', 4],
  ['Google News - Chung khoan', 'chứng khoán Việt Nam', 'kinh-doanh', 4],
  ['Google News - Bat dong san', 'bất động sản Việt Nam', 'kinh-doanh', 3],
  ['Google News - Gia vang', 'giá vàng Việt Nam', 'kinh-doanh', 3],
  ['Google News - Xuat nhap khau', 'xuất nhập khẩu Việt Nam', 'kinh-doanh', 3],
  ['Google News - Suc khoe', 'sức khỏe Việt Nam', 'suc-khoe', 4],
  ['Google News - Y te', 'y tế Việt Nam', 'suc-khoe', 4],
  ['Google News - Benh vien', 'bệnh viện Việt Nam', 'suc-khoe', 3],
  ['Google News - Dinh duong', 'dinh dưỡng sức khỏe', 'suc-khoe', 3],
  ['Google News - Dich benh', 'dịch bệnh Việt Nam', 'suc-khoe', 3],
  ['Google News - Khoa hoc', 'khoa học Việt Nam', 'khoa-hoc', 4],
  ['Google News - Nghien cuu khoa hoc', 'nghiên cứu khoa học', 'khoa-hoc', 3],
  ['Google News - Vu tru', 'vũ trụ khoa học', 'khoa-hoc', 3],
  ['Google News - Moi truong', 'môi trường khoa học', 'khoa-hoc', 3],
  ['Google News - The gioi', 'thế giới quốc tế', 'the-gioi', 4],
  ['Google News - Dong Nam A', 'Đông Nam Á', 'the-gioi', 3],
  ['Google News - My Trung Quoc', 'Mỹ Trung Quốc', 'the-gioi', 3],
  ['Google News - Ukraine', 'Ukraine Nga', 'the-gioi', 3],
  ['Google News - Tin khac doi song', 'đời sống xã hội', 'khac', 2],
  ['Google News - Van hoa giai tri', 'văn hóa giải trí Việt Nam', 'khac', 2]
].map(([name, query, category, priority, language]) => googleNewsFeed(name, query, category, priority, language));

const seenFeedUrls = new Set();
export const defaultFeeds = [...defaultFeedsBase, ...supplementalGoogleFeeds].filter((feed) => {
  if (seenFeedUrls.has(feed.url)) return false;
  seenFeedUrls.add(feed.url);
  return true;
});

export const categories = [
  { key: 'moi-nhat', label: 'Mới nhất', icon: '⚡' },
  { key: 'nong-nghiep', label: 'Nông nghiệp', icon: '🌾' },
  { key: 'lua-gao', label: 'Lúa gạo', icon: '🍚' },
  { key: 'nong-nghiep-the-gioi', label: 'Nông nghiệp thế giới', icon: '🌍' },
  { key: 'bong-da', label: 'Bóng đá', icon: '⚽' },
  { key: 'thoi-su', label: 'Thời sự', icon: '📰' },
  { key: 'giao-thong', label: 'Giao thông', icon: '🚦' },
  { key: 'an-toan-lao-dong', label: 'An toàn lao động', icon: '🦺' },
  { key: 'cong-nghe', label: 'Công nghệ', icon: '🤖' },
  { key: 'kinh-doanh', label: 'Kinh doanh', icon: '📈' },
  { key: 'suc-khoe', label: 'Sức khỏe', icon: '💚' },
  { key: 'khoa-hoc', label: 'Khoa học', icon: '🔬' },
  { key: 'the-gioi', label: 'Thế giới', icon: '🌐' }
];
