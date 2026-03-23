(function () {
  'use strict';

  var container = document.getElementById('arch-diagram');
  var tooltip   = document.getElementById('arch-tooltip');
  if (!container) return;

  var C = {
    cyan:    '#00f0ff',
    magenta: '#ff00aa',
    green:   '#00ff88',
    orange:  '#ffaa00',
    purple:  '#8855ff',
    red:     '#ff6432',
    bg:      'rgba(10,10,15,0.8)',
    bgHover: 'rgba(10,10,15,0.95)',
    dimText: 'rgba(255,255,255,0.25)',
    subText: 'rgba(255,255,255,0.4)',
  };

  //SVG HELPERS
  var NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        e.setAttribute(k, String(attrs[k]));
      });
    }
    return e;
  }

  function txt(parent, x, y, str, opts) {
    var o = opts || {};
    var t = el('text', {
      x: x, y: y,
      'text-anchor':    o.anchor || 'middle',
      'fill':           o.fill   || C.dimText,
      'font-family':    o.font   || "'JetBrains Mono', monospace",
      'font-size':      o.size   || 9,
      'font-weight':    o.weight || '400',
      'letter-spacing': o.ls     || '0',
      'fill-opacity':   o.opacity || '1',
    });
    t.textContent = str;
    parent.appendChild(t);
    return t;
  }

  //SVG CANVAS
  var W = 1000, H = 620;
  var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, xmlns: NS });
  svg.style.width = '100%';
  svg.style.display = 'block';

  var defs = el('defs', {});
  defs.innerHTML =
    '<pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">' +
      '<path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,240,255,0.04)" stroke-width="0.5"/>' +
    '</pattern>' +
    '<filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/>' +
      '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
    '<marker id="arrowPink" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">' +
      '<path d="M0,0 L6,2 L0,4" fill="rgba(255,0,170,0.4)"/></marker>';
  svg.appendChild(defs);

  svg.appendChild(el('rect', { width: W, height: H, fill: 'rgba(8,8,12,0.9)' }));
  svg.appendChild(el('rect', { width: W, height: H, fill: 'url(#grid)' }));

  //PROXMOX FRAME
  svg.appendChild(el('rect', {
    x: 10, y: 10, width: W - 20, height: H - 20, rx: 3,
    fill: 'none', stroke: 'rgba(0,240,255,0.1)', 'stroke-width': 1, 'stroke-dasharray': '6 3',
  }));
  txt(svg, 30, 38, 'PROXMOX NODE - ns3247542 (OVH Bare Metal)', {
    anchor: 'start', fill: 'rgba(0,240,255,0.4)',
    font: "'Orbitron', sans-serif", size: 10, ls: '3',
  });

  //INTERNET / WAN
  var wanX = W / 2, wanY = 70;
  svg.appendChild(el('rect', {
    x: wanX - 80, y: wanY - 20, width: 160, height: 40, rx: 2,
    fill: 'rgba(255,0,170,0.08)', stroke: 'rgba(255,0,170,0.4)', 'stroke-width': 1,
  }));
  txt(svg, wanX, wanY + 5, 'INTERNET / WAN', {
    fill: 'rgba(255,0,170,0.9)', font: "'Orbitron', sans-serif", size: 10, ls: '2',
  });

  svg.appendChild(el('line', {
    x1: wanX, y1: wanY + 20, x2: wanX, y2: 140,
    stroke: 'rgba(255,0,170,0.3)', 'stroke-width': 1, 'stroke-dasharray': '4 3',
  }));

  //PFSENSE + SURICATA
  var pfsX = wanX, pfsY = 165;

  svg.appendChild(el('rect', {
    x: pfsX - 130, y: pfsY - 25, width: 260, height: 50, rx: 2,
    fill: 'rgba(0,240,255,0.06)', stroke: 'rgba(0,240,255,0.5)',
    'stroke-width': 1.5, filter: 'url(#glow)',
  }));
  txt(svg, pfsX, pfsY - 3, 'PFSENSE + SURICATA', {
    fill: C.cyan, font: "'Orbitron', sans-serif", size: 11, weight: '600', ls: '2',
  });
  txt(svg, pfsX, pfsY + 13, 'Gateway / Firewall / IDS-IPS', {
    fill: 'rgba(0,240,255,0.5)', size: 8,
  });

  var pfsHit = el('rect', {
    x: pfsX - 130, y: pfsY - 25, width: 260, height: 50,
    fill: 'transparent', cursor: 'pointer',
  });
  svg.appendChild(pfsHit);
  bindTooltip(pfsHit, 'pfSense + Suricata IDS/IPS',
    'Firewall/routeur central - VLAN trunking, NAT, règles inter-VLAN, DNS, DHCP. Suricata intégré pour l\'analyse trafic réseau en temps réel.');

  //CONNECTION LINES pfSense -> VLANs
  var splitY = 230;
  var dmzCX = 180, srvCX = 500, lanCX = 820;


  svg.appendChild(el('line', {
    x1: pfsX, y1: pfsY + 25, x2: pfsX, y2: splitY,
    stroke: 'rgba(0,240,255,0.2)', 'stroke-width': 1,
  }));

  svg.appendChild(el('line', {
    x1: dmzCX, y1: splitY, x2: lanCX, y2: splitY,
    stroke: 'rgba(0,240,255,0.12)', 'stroke-width': 1,
  }));

  [dmzCX, srvCX, lanCX].forEach(function (cx) {
    svg.appendChild(el('line', {
      x1: cx, y1: splitY, x2: cx, y2: 260,
      stroke: 'rgba(0,240,255,0.15)', 'stroke-width': 1, 'stroke-dasharray': '4 3',
    }));
  });

  // VLAN BOXES
  var vlansTop = 260;

  var dmzW = 280, dmzH = 140;
  drawVlanBox(dmzCX - dmzW / 2, vlansTop, dmzW, dmzH,
    C.cyan, 'VLAN DMZ / ADMIN', '192.168.40.0/24');

  var srvW = 280, srvH = 310;
  drawVlanBox(srvCX - srvW / 2, vlansTop, srvW, srvH,
    C.magenta, 'VLAN SERVER', '192.168.30.0/24');

  var lanW = 280, lanH = 140;
  drawVlanBox(lanCX - lanW / 2, vlansTop, lanW, lanH,
    C.green, 'VLAN LAN', 'Sécurité / SIEM');

  function drawVlanBox(x, y, w, h, color, label, sub) {
    svg.appendChild(el('rect', {
      x: x, y: y, width: w, height: h, rx: 3,
      fill: color.replace('#', 'rgba(') ? 'rgba(0,0,0,0)' : 'none',
      stroke: color, 'stroke-opacity': 0.15, 'stroke-width': 1,
    }));

    var fill = el('rect', {
      x: x, y: y, width: w, height: h, rx: 3,
      fill: color, 'fill-opacity': 0.02, stroke: 'none',
    });
    svg.appendChild(fill);

    txt(svg, x + 15, y + 20, label, {
      anchor: 'start', fill: color,
      font: "'Orbitron', sans-serif", size: 9, ls: '2', opacity: '0.6',
    });
    txt(svg, x + w - 15, y + 20, sub, {
      anchor: 'end', fill: C.dimText, size: 8, opacity: '0.5',
    });
  }

  //VM NODES
  var nW = 120, nH = 55, nGap = 12;

  var dmzL = dmzCX - dmzW / 2 + 18;
  var dmzT = vlansTop + 35;

  drawNode(dmzL, dmzT, 'Bastion', 'Guacamole', '.40.10', C.green,
    'EPSI-S-BASTION-01',
    'VM 110 - 192.168.40.10 - Apache Guacamole, Tomcat 9, Temurin JDK 17, accès SSH/RDP centralisé');
  drawNode(dmzL + nW + nGap, dmzT, 'Reverse Proxy', 'Nginx', '.40.20', C.cyan,
    'EPSI-S-RP-01',
    '192.168.40.20 - Nginx reverse proxy, upstream dynamique via Terraform, TLS termination');

  var srvL = srvCX - srvW / 2 + 18;
  var srvT = vlansTop + 35;

  drawNode(srvL, srvT, 'MariaDB', 'Master', '.30.10', C.magenta,
    'EPSI-S-BDD-01',
    'MariaDB Master - base principale, réplication vers slave, backend Guacamole + LAMP');
  drawNode(srvL + nW + nGap, srvT, 'MariaDB', 'Slave', '.30.11', C.magenta,
    'EPSI-S-BDD-02',
    'MariaDB Slave - réplication depuis Master, haute disponibilité, failover');

  svg.appendChild(el('line', {
    x1: srvL + nW, y1: srvT + 22, x2: srvL + nW + nGap, y2: srvT + 22,
    stroke: 'rgba(255,0,170,0.3)', 'stroke-width': 1, 'marker-end': 'url(#arrowPink)',
  }));

  var row2Y = srvT + nH + nGap;
  drawNode(srvL, row2Y, 'LAMP-01', 'Apache + PHP', '.30.20', C.magenta,
    'EPSI-S-LAMP-01',
    'VM LAMP - Terraform full clone depuis template 9000 (debian-lamp-template), Apache + PHP');
  drawNode(srvL + nW + nGap, row2Y, 'LAMP-02', 'Apache + PHP', '.30.21', C.magenta,
    'EPSI-S-LAMP-02',
    'VM LAMP #2 - provisionnée Terraform, upstream Nginx automatique');

  var tfX = srvL - 6;
  var tfY = row2Y - 6;
  var tfW = nW * 2 + nGap + 12;
  var tfH = nH + 12;
  svg.appendChild(el('rect', {
    x: tfX, y: tfY, width: tfW, height: tfH, rx: 2,
    fill: 'rgba(136,85,255,0.03)', stroke: 'rgba(136,85,255,0.3)',
    'stroke-width': 1, 'stroke-dasharray': '4 3',
  }));
  txt(svg, srvCX, tfY + tfH + 14, '\u2699 Terraform Provisioned', {
    fill: 'rgba(136,85,255,0.6)', size: 8, ls: '1',
  });

  var row3Y = row2Y + nH + nGap + 25;
  drawNode(srvL, row3Y, 'Zabbix', 'Monitoring', '.30.50', C.orange,
    'EPSI-S-ZABBIX-01',
    'Monitoring infrastructure - métriques CPU/RAM/disk/réseau, alertes, dashboards');
  drawNode(srvL + nW + nGap, row3Y, 'GLPI', 'Asset Mgmt', '.30.60', C.orange,
    'EPSI-S-GLPI-01',
    'Gestion de parc - inventaire, ticketing, suivi des actifs');

  var lanL = lanCX - nW / 2;
  var lanT = vlansTop + 35;

  drawNode(lanL, lanT, 'Wazuh SIEM', 'Manager + OSSEC', 'LAN', C.orange,
    'EPSI-S-WAZUH-01',
    'Wazuh Manager - SIEM centralisé, agents OSSEC sur toutes les VMs, corrélation d\'événements, alertes temps réel');

  //LEGEND
  var legX = lanCX - lanW / 2 + 15;
  var legY = vlansTop + lanH + 30;

  txt(svg, legX, legY, 'LÉGENDE', {
    anchor: 'start', fill: C.subText,
    font: "'Orbitron', sans-serif", size: 8, ls: '2',
  });

  var legends = [
    { color: C.cyan,    label: 'DMZ / Admin' },
    { color: C.magenta, label: 'Serveurs' },
    { color: C.green,   label: 'LAN / Clients' },
    { color: C.orange,  label: 'Sécurité / SIEM' },
  ];
  legends.forEach(function (leg, i) {
    var ly = legY + 16 + i * 18;
    svg.appendChild(el('rect', {
      x: legX, y: ly - 8, width: 10, height: 10, rx: 1,
      fill: leg.color, 'fill-opacity': 0.15, stroke: leg.color, 'stroke-opacity': 0.4, 'stroke-width': 0.5,
    }));
    txt(svg, legX + 16, ly, leg.label, {
      anchor: 'start', fill: C.subText, size: 7,
    });
  });

  //DRAW NODE FUNCTION
  function drawNode(x, y, name, sub, ip, color, tooltipName, tooltipDetail) {
    var g = el('g', {});
    g.style.cursor = 'pointer';

    var bg = el('rect', {
      x: x, y: y, width: nW, height: nH, rx: 2,
      fill: color.replace(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i, function (m, r, g, b) {
        return 'rgba(' + parseInt(r, 16) + ',' + parseInt(g, 16) + ',' + parseInt(b, 16) + ',0.05)';
      }),
      stroke: color, 'stroke-opacity': 0.4, 'stroke-width': 1,
    });
    g.appendChild(bg);

    var glow = el('rect', {
      x: x, y: y, width: nW, height: nH, rx: 2,
      fill: 'none', stroke: color, 'stroke-opacity': 0, 'stroke-width': 1.5,
      filter: 'url(#glow)',
    });
    g.appendChild(glow);

    txt(g, x + nW / 2, y + 18, name, {
      fill: color, font: "'JetBrains Mono', monospace", size: 9, weight: '600', opacity: '0.9',
    });

    txt(g, x + nW / 2, y + 32, sub, {
      fill: color, size: 7, opacity: '0.5',
    });

    txt(g, x + nW / 2, y + 44, ip, {
      fill: color, size: 7, opacity: '0.3',
    });

    svg.appendChild(g);

    g.addEventListener('mouseenter', function () {
      glow.setAttribute('stroke-opacity', '0.6');
      bg.setAttribute('stroke-opacity', '0.8');
    });
    g.addEventListener('mouseleave', function () {
      glow.setAttribute('stroke-opacity', '0');
      bg.setAttribute('stroke-opacity', '0.4');
    });

    bindTooltip(g, tooltipName, tooltipDetail);
  }

  //TOOLTIP
  function bindTooltip(element, name, detail) {
    if (!tooltip) return;

    element.addEventListener('mouseenter', function () {
      tooltip.querySelector('.arch-tooltip__name').textContent = name;
      tooltip.querySelector('.arch-tooltip__detail').textContent = detail;
      tooltip.classList.add('visible');
    });

    element.addEventListener('mousemove', function (e) {
      var rect = container.closest('.arch-container').getBoundingClientRect();
      var tx = e.clientX - rect.left + 16;
      var ty = e.clientY - rect.top - 10;

      if (tx + 300 > rect.width) tx = e.clientX - rect.left - 320;
      if (ty < 0) ty = 10;

      tooltip.style.left = tx + 'px';
      tooltip.style.top = ty + 'px';
    });

    element.addEventListener('mouseleave', function () {
      tooltip.classList.remove('visible');
    });

    element.addEventListener('click', function () {
      tooltip.querySelector('.arch-tooltip__name').textContent = name;
      tooltip.querySelector('.arch-tooltip__detail').textContent = detail;
      tooltip.classList.add('visible');
    });
  }

  // INJECT
  container.innerHTML = '';
  container.appendChild(svg);

})();
