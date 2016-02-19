/***
 * Page level scripts for index.html
 */

function showTooltip(selector, content) {
  $(selector).attr('data-original-title', content)
    .tooltip({
      trigger: 'manual',
      placement: 'bottom'
    })
    .tooltip('show');;
}

$(function() {
  $('input').addClass('form-control input-lg');
  $('.things-to-do .btn').click(function() {
    var hookName = $(this).attr('data-hook');
    ga('send', 'event', hookName, 'click', hookName != 'start-code' ? 'index' : undefined);
  })
});
