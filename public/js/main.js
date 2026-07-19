(function () {
  'use strict';

  // --- Ghi nhận lượt truy cập (1 lần / lần tải trang) ---
  function trackVisit() {
    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: window.location.pathname,
          referrer: document.referrer || '',
        }),
        keepalive: true,
      }).catch(function () {});
    } catch (e) {
      /* bo qua neu trinh duyet chan */
    }
  }
  trackVisit();

  // --- FAQ accordion ---
  var faqList = document.getElementById('faqList');
  if (faqList) {
    faqList.addEventListener('click', function (e) {
      var btn = e.target.closest('.faq-question');
      if (!btn) return;
      var item = btn.closest('.faq-item');
      var isOpen = item.getAttribute('data-open') === 'true';
      faqList.querySelectorAll('.faq-item').forEach(function (el) {
        el.setAttribute('data-open', 'false');
      });
      item.setAttribute('data-open', isOpen ? 'false' : 'true');
    });
  }

  // --- Lead form submit ---
  var leadForm = document.getElementById('leadForm');
  var formMsg = document.getElementById('formMsg');

  function setMsg(text, type) {
    if (!formMsg) return;
    formMsg.textContent = text;
    formMsg.className = 'form-msg ' + (type || '');
  }

  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('name').value.trim();
      var phone = document.getElementById('phone').value.trim();
      var note = document.getElementById('note').value.trim();

      if (name.length < 2) {
        setMsg('Vui lòng nhập họ tên hợp lệ.', 'error');
        return;
      }
      var phoneOk = /^[0-9+][0-9 .-]{7,14}$/.test(phone);
      if (!phoneOk) {
        setMsg('Vui lòng nhập số điện thoại hợp lệ.', 'error');
        return;
      }

      var submitBtn = leadForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      setMsg('Đang gửi...', '');

      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          phone: phone,
          note: note,
          source: 'landing-page',
        }),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.ok && result.data.ok) {
            setMsg('Cảm ơn anh/chị! Nhân viên sẽ liên hệ tư vấn trong thời gian sớm nhất.', 'success');
            leadForm.reset();
          } else {
            setMsg(result.data.error || 'Có lỗi xảy ra, vui lòng thử lại.', 'error');
          }
        })
        .catch(function () {
          setMsg('Không thể kết nối máy chủ, vui lòng thử lại sau.', 'error');
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
})();
