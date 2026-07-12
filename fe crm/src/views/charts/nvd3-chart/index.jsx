import React from 'react';

import {
  Card,
  Col,
  Row
} from 'react-bootstrap';

import BarDiscreteChart from './chart/BarDiscreteChart';
import GroupedColumnChart from './chart/GroupedChart';
import LineChart from './chart/LineChart';
import PieBasicChart from './chart/PieBasicChart';
import PieDonutChart from './chart/PieDonutChart';

const Nvd3Chart = () => {
  return (
    <>
      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Line Chart</Card.Title>
            </Card.Header>
            <Card.Body>
              <LineChart />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Discrete Bar Chart</Card.Title>
            </Card.Header>
            <Card.Body>
              <BarDiscreteChart />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Grouped Multi-Bar Chart</Card.Title>
            </Card.Header>
            <Card.Body>
              <GroupedColumnChart />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Pie Basic Chart</Card.Title>
            </Card.Header>
            <Card.Body className="text-center">
              <PieBasicChart />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Donut Chart</Card.Title>
            </Card.Header>
            <Card.Body className="text-center">
              <PieDonutChart />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Nvd3Chart;
