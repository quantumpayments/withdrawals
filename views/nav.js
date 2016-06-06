function getNav(config) {
  config = config || {}
  var nav = `

  <div class="bs-example">
      <nav role="navigation" class="navbar navbar-default">
          <!-- Brand and toggle get grouped for better mobile display -->
          <div class="navbar-header">
              <button type="button" data-target="#navbarCollapse" data-toggle="collapse" class="navbar-toggle">
                  <span class="sr-only">Toggle navigation</span>
                  <span class="icon-bar"></span>
                  <span class="icon-bar"></span>
                  <span class="icon-bar"></span>
              </button>
              <a href="#" class="navbar-brand">Quantum</a>
          </div>
          <!-- Collection of nav links and other content for toggling -->
          <div id="navbarCollapse" class="collapse navbar-collapse">
              <ul class="nav navbar-nav">`
              if (config.ui && config.ui.tabs) {
                var tabs = config.ui.tabs
                for (var key in tabs) {
                   if (tabs.hasOwnProperty(key)) {
                     nav += '<li><a href="'+ tabs[key] +'">'+ key +'</a></li>'
                   }
                }

              } else {
  nav += `
                  <li><a href="/">Home</a></li>
                  <li><a href="/balance">Balance</a></li>
                  <li><a href="/random">Content</a></li>
                  <li><a href="/faucet">Faucet</a></li>
                  <li><a href="/deposit">Deposit</a></li>
                  <li><a href="/withdrawal">Withdrawal</a></li>`

              }

  nav += `
              </ul>
              <ul class="nav navbar-nav navbar-right">
                  <li><a href="#">Login</a></li>
              </ul>
          </div>
      </nav>
  </div>

  <aside class="main-sidebar">
    <!-- sidebar: style can be found in sidebar.less -->
    <section class="sidebar">

    </section>
  </aside>

  <div class="content-wrapper">
  <section class="content-header">

  `
  return nav
}


module.exports = getNav
