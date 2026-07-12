import React, { useEffect, useMemo, useState } from 'react';

import PropTypes from 'prop-types';
import { ListGroup } from 'react-bootstrap';

import NavCollapse from '../NavCollapse';
import NavItem from '../NavItem';

const NavGroup = ({ layout, group }) => {
  const storageKey = useMemo(() => `menu-order-items-${group.id}`,[group.id]);
  const [orderedChildren, setOrderedChildren] = useState([]);
  const [dragItemId, setDragItemId] = useState(null);

  useEffect(() => {
    const children = Array.isArray(group.children) ? group.children : Object.values(group.children || {});
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const idToItem = new Map(children.map((c) => [c.id, c]));
      const restored = saved.filter((id) => idToItem.has(id)).map((id) => idToItem.get(id));
      const missing = children.filter((c) => !saved.includes(c.id));
      setOrderedChildren([...restored, ...missing]);
    } catch (e) {
      setOrderedChildren(children);
    }
  }, [group.children, storageKey]);

  const persistOrder = (items) => {
    localStorage.setItem(storageKey, JSON.stringify(items.map((i) => i.id)));
  };

  const onDragStart = (e, id) => {
    setDragItemId(id);
    try {
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'move';
    } catch (err) {
      /* ignore */
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, overId) => {
    e.preventDefault();
    const fromId = dragItemId || e.dataTransfer.getData('text/plain');
    if (!fromId || fromId === overId) return;
    const updated = [...orderedChildren];
    const fromIndex = updated.findIndex((c) => c.id === fromId);
    const toIndex = updated.findIndex((c) => c.id === overId);
    if (fromIndex === -1 || toIndex === -1) return;
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setOrderedChildren(updated);
    persistOrder(updated);
    setDragItemId(null);
  };

  const navItems = orderedChildren.map((item) => {
    switch (item.type) {
      case 'collapse':
        return (
          <div
            key={`nav-collapse-wrapper-${item.id}`}
            data-id={item.id}
            draggable
            onDragStart={(e) => onDragStart(e, item.id)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, item.id)}
          >
            <NavCollapse key={item.id} collapse={item} type="main" />
          </div>
        );
      case 'item':
        return (
          <div
            key={`nav-item-wrapper-${item.id}`}
            data-id={item.id}
            draggable
            onDragStart={(e) => onDragStart(e, item.id)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, item.id)}
          >
            <NavItem layout={layout} key={item.id} item={item} />
          </div>
        );
      default:
        return false;
    }
  });

  return (
    <React.Fragment>
      <ListGroup.Item as="li" bsPrefix=" " key={group.id} className="nav-item pcoded-menu-caption">
        <label style={{ fontSize: '15px' }}>{group.title}</label>
      </ListGroup.Item>
      {navItems}
    </React.Fragment>
  );
};

NavGroup.propTypes = {
  layout: PropTypes.string,
  group: PropTypes.object,
  id: PropTypes.number,
  children: PropTypes.node,
  title: PropTypes.string
};

export default NavGroup;
